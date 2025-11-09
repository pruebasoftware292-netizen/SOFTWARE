import { useState } from 'react';
import { X, Save, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PaymentFormModalProps {
  dispatchId: string;
  dispatchNumber: string;
  clientUserId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentFormModal({
  dispatchId,
  dispatchNumber,
  clientUserId,
  onClose,
  onSuccess,
}: PaymentFormModalProps) {
  const [formData, setFormData] = useState({
    amount: '',
    payment_type: '',
    status: 'pending' as 'pending' | 'paid',
    due_date: '',
    paid_date: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const paymentTypes = [
    { value: 'customs_duties', label: 'Derechos Aduaneros' },
    { value: 'import_tax', label: 'Impuesto de Importación' },
    { value: 'storage_fees', label: 'Tarifas de Almacenamiento' },
    { value: 'inspection_fees', label: 'Tarifas de Inspección' },
    { value: 'transport_costs', label: 'Costos de Transporte' },
    { value: 'service_fees', label: 'Tarifas de Servicio' },
    { value: 'handling_fees', label: 'Tarifas de Manipulación' },
    { value: 'documentation_fees', label: 'Tarifas de Documentación' },
    { value: 'other', label: 'Otro' },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setSubmitting(true);

    try {
      const paymentData: any = {
        dispatch_id: dispatchId,
        amount: parseFloat(formData.amount),
        payment_type: formData.payment_type,
        status: formData.status,
        due_date: formData.due_date || null,
        notes: formData.notes || null,
      };

      if (formData.status === 'paid' && formData.paid_date) {
        paymentData.paid_date = formData.paid_date;
      }

      const { error } = await supabase.from('payments').insert(paymentData);

      if (error) throw error;

      if (clientUserId) {
        const paymentTypeLabel = paymentTypes.find(t => t.value === formData.payment_type)?.label || formData.payment_type;
        await supabase.from('notifications').insert({
          user_id: clientUserId,
          dispatch_id: dispatchId,
          type: 'payment_added',
          title: 'Nuevo Registro de Pago',
          message: `Se ha agregado un nuevo pago de $${parseFloat(formData.amount).toFixed(2)} (${paymentTypeLabel}) al despacho ${dispatchNumber}`,
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error adding payment:', error);
      alert(`Error al agregar pago: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-white" />
            <h3 className="text-xl font-bold text-white">Agregar Pago</h3>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tipo de Pago *
            </label>
            <select
              value={formData.payment_type}
              onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">Seleccionar tipo de pago...</option>
              {paymentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Monto (USD) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Estado *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {formData.status === 'paid' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Pago
              </label>
              <input
                type="date"
                value={formData.paid_date}
                onChange={(e) => setFormData({ ...formData, paid_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="Notas adicionales sobre el pago..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {submitting ? 'Agregando...' : 'Agregar Pago'}
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
