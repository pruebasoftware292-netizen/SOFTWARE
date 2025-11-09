/*
  # Configuración de Supabase Storage para Documentos

  1. Nuevo Bucket de Storage
    - `dispatch-documents` - Almacenamiento de documentos de despachos
    
  2. Políticas de Seguridad
    - Los administradores pueden subir, ver y eliminar cualquier documento
    - Los clientes pueden ver solo documentos de sus propios despachos
    - Documentos organizados por dispatch_id/filename
    
  3. Notas Importantes
    - Los archivos se guardan en la ruta: dispatch_id/filename
    - Solo usuarios autenticados tienen acceso
    - RLS protege el acceso basado en roles
*/

-- Crear bucket para documentos de despachos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'dispatch-documents',
  'dispatch-documents',
  false,
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Política: Admins pueden subir archivos
CREATE POLICY "Admins can upload dispatch documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'dispatch-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Política: Admins pueden ver todos los documentos
CREATE POLICY "Admins can view all dispatch documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'dispatch-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Política: Clientes pueden ver documentos de sus propios despachos
CREATE POLICY "Clients can view own dispatch documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'dispatch-documents'
  AND EXISTS (
    SELECT 1 
    FROM dispatches d
    JOIN clients c ON c.id = d.client_id
    WHERE c.user_id = auth.uid()
    AND (storage.objects.name LIKE d.id::text || '/%')
  )
);

-- Política: Admins pueden eliminar documentos
CREATE POLICY "Admins can delete dispatch documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'dispatch-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Política: Admins pueden actualizar documentos
CREATE POLICY "Admins can update dispatch documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'dispatch-documents'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
