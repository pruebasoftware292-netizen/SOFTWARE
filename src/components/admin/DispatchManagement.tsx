import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Search, Package } from 'lucide-react';
import { DispatchDetail } from './DispatchDetail';
import { CreateDispatchForm } from './CreateDispatchForm';
import type { Database } from '../../lib/database.types';

type Dispatch = Database['public']['Tables']['dispatches']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'];
};

export function DispatchManagement() {
  const { user } = useAuth();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [filteredDispatches, setFilteredDispatches] = useState<Dispatch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    loadDispatches();
    loadClients();
  }, []);

  useEffect(() => {
    const filtered = dispatches.filter(dispatch =>
      dispatch.dispatch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.bl_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispatch.client.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDispatches(filtered);
  }, [searchTerm, dispatches]);

  async function loadDispatches() {
    try {
      const { data, error } = await supabase
        .from('dispatches')
        .select(`
          *,
          client:clients(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDispatches(data as any);
      setFilteredDispatches(data as any);
    } catch (error) {
      console.error('Error loading dispatches:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadClients() {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }

  async function handleCreateDispatch(formData: any) {
    try {
      const { error } = await supabase
        .from('dispatches')
        .insert({
          ...formData,
          created_by: user!.id,
        });

      if (error) throw error;

      const { data: clientData } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', formData.client_id)
        .maybeSingle();

      if (clientData?.user_id) {
        await supabase.from('notifications').insert({
          user_id: clientData.user_id,
          type: 'dispatch_created',
          title: 'Nuevo Despacho Creado',
          message: `Se ha creado un nuevo despacho ${formData.dispatch_number} para tu empresa`,
        });
      }

      setShowCreateForm(false);
      loadDispatches();
    } catch (error: any) {
      alert(error.message);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-amber-100 text-amber-800';
      case 'customs':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'COMPLETADO';
      case 'in_transit':
        return 'EN TRÁNSITO';
      case 'pending':
        return 'PENDIENTE';
      case 'customs':
        return 'EN ADUANA';
      default:
        return status.toUpperCase();
    }
  };

  const getChannelColor = (channel: string | null) => {
    switch (channel) {
      case 'green':
        return 'bg-green-500';
      case 'orange':
        return 'bg-orange-500';
      case 'red':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getChannelLabel = (channel: string | null) => {
    switch (channel) {
      case 'green':
        return 'VERDE';
      case 'orange':
        return 'NARANJA';
      case 'red':
        return 'ROJO';
      case 'pending':
        return 'PENDIENTE';
      default:
        return channel?.toUpperCase() || 'N/A';
    }
  };

  if (selectedDispatch) {
    return (
      <DispatchDetail
        dispatch={selectedDispatch}
        onBack={() => {
          setSelectedDispatch(null);
          loadDispatches();
        }}
      />
    );
  }

  return (
    <div>
      {showCreateForm && (
        <CreateDispatchForm
          clients={clients}
          onSubmit={handleCreateDispatch}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Gestión de Despachos</h2>
          <p className="text-gray-600 mt-1">Administra todos los despachos aduaneros</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nuevo Despacho
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg mb-6 p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número de despacho, BL o cliente..."
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse border border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : filteredDispatches.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron despachos' : 'No hay despachos todavía'}
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta ajustar tu búsqueda' : 'Crea tu primer despacho para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredDispatches.map((dispatch) => (
            <div
              key={dispatch.id}
              onClick={() => setSelectedDispatch(dispatch)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 cursor-pointer border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900">
                      {dispatch.dispatch_number}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(dispatch.status)}`}>
                      {getStatusLabel(dispatch.status)}
                    </span>
                    {dispatch.channel && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getChannelColor(dispatch.channel)}`}>
                        Canal: {getChannelLabel(dispatch.channel)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Cliente: {dispatch.client.company_name}</p>
                  {dispatch.bl_number && (
                    <p className="text-sm text-gray-600">BL: {dispatch.bl_number}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {dispatch.supplier && (
                  <div>
                    <p className="text-gray-500 font-medium">Proveedor</p>
                    <p className="font-semibold text-gray-900">{dispatch.supplier}</p>
                  </div>
                )}
                {dispatch.shipping_line && (
                  <div>
                    <p className="text-gray-500 font-medium">Naviera</p>
                    <p className="font-semibold text-gray-900">{dispatch.shipping_line}</p>
                  </div>
                )}
                {dispatch.arrival_date && (
                  <div>
                    <p className="text-gray-500 font-medium">Fecha de Llegada</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(dispatch.arrival_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}
                {dispatch.port && (
                  <div>
                    <p className="text-gray-500 font-medium">Puerto</p>
                    <p className="font-semibold text-gray-900">{dispatch.port}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
