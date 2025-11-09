import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CreateClientRequest {
  email: string;
  password: string;
  company_name: string;
  ruc: string;
  phone?: string;
  address?: string;
  contact_person?: string;
  notes?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get the admin user from the request
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !adminUser) {
      throw new Error('No autorizado');
    }

    // Verify the user is an admin
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single();

    if (profile?.role !== 'admin') {
      throw new Error('Solo los administradores pueden crear clientes');
    }

    const body: CreateClientRequest = await req.json();

    // 1. Create user in Supabase Auth
    const { data: authData, error: createUserError } = await supabaseClient.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        full_name: body.contact_person || body.company_name,
      },
    });

    if (createUserError) throw createUserError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    // 2. Create profile with role='client'
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: body.email,
        full_name: body.contact_person || body.company_name,
        role: 'client',
      });

    if (profileError) throw profileError;

    // 3. Create client record
    const { data: clientData, error: clientError } = await supabaseClient
      .from('clients')
      .insert({
        user_id: authData.user.id,
        company_name: body.company_name,
        ruc: body.ruc,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        contact_person: body.contact_person || null,
        notes: body.notes || null,
        created_by: adminUser.id,
      })
      .select()
      .single();

    if (clientError) throw clientError;

    return new Response(
      JSON.stringify({
        success: true,
        data: clientData,
        message: 'Cliente creado exitosamente',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
