import { useState } from 'react';
import { X, Save, Upload, FileUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DocumentUploadModalProps {
  dispatchId: string;
  dispatchNumber: string;
  clientUserId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadModal({
  dispatchId,
  dispatchNumber,
  clientUserId,
  onClose,
  onSuccess,
}: DocumentUploadModalProps) {
  const [formData, setFormData] = useState({
    document_type: 'invoice',
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const documentTypes = [
    { value: 'invoice', label: 'Factura' },
    { value: 'packing_list', label: 'Lista de Empaque' },
    { value: 'bl', label: 'Conocimiento de Embarque' },
    { value: 'vuce', label: 'VUCE' },
    { value: 'co', label: 'Certificado de Origen' },
    { value: 'payment_proof', label: 'Comprobante de Pago' },
    { value: 'customs_declaration', label: 'Declaración Aduanera' },
    { value: 'other', label: 'Otro' },
  ];

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Máximo 10MB permitido.');
        return;
      }
      setSelectedFile(file);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Usuario no autenticado');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const filePath = `${dispatchId}/${fileName}`;

      setUploadProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('dispatch-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      const { error: dbError } = await supabase.from('documents').insert({
        dispatch_id: dispatchId,
        document_type: formData.document_type,
        file_name: selectedFile.name,
        file_path: filePath,
        file_size: selectedFile.size,
        notes: formData.notes,
        uploaded_by: userId,
      });

      if (dbError) {
        await supabase.storage.from('dispatch-documents').remove([filePath]);
        throw dbError;
      }

      setUploadProgress(90);

      if (clientUserId) {
        await supabase.from('notifications').insert({
          user_id: clientUserId,
          dispatch_id: dispatchId,
          type: 'document_uploaded',
          title: 'Nuevo Documento Disponible',
          message: `Se ha subido un nuevo documento (${documentTypes.find(t => t.value === formData.document_type)?.label}) para el despacho ${dispatchNumber}`,
        });
      }

      setUploadProgress(100);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      alert(`Error al subir documento: ${error.message}`);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-white" />
            <h3 className="text-xl font-bold text-white">Subir Documento</h3>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Documento *
            </label>
            <select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              required
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Seleccionar Archivo *
            </label>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                className="hidden"
                id="file-upload"
                required
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all duration-200"
              >
                <FileUp className="w-8 h-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un archivo'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, JPG, PNG, DOC, XLS (máx. 10MB)
                  </p>
                </div>
              </label>
            </div>
            {selectedFile && (
              <div className="mt-2 text-sm text-gray-600">
                Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Notas adicionales sobre este documento..."
            />
          </div>

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {submitting ? 'Subiendo...' : 'Subir Documento'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-all duration-200 font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
