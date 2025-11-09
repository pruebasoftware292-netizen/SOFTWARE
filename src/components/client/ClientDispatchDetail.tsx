import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  Download,
  Clock,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { ShipmentTracking } from '../ShipmentTracking';
import type { Database } from '../../lib/database.types';

type Dispatch = Database['public']['Tables']['dispatches']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'];
};
type TimelineEntry = Database['public']['Tables']['dispatch_timeline']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

interface ClientDispatchDetailProps {
  dispatch: Dispatch;
  onBack: () => void;
}

export function ClientDispatchDetail({ dispatch, onBack }: ClientDispatchDetailProps) {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDispatchData();
  }, [dispatch.id]);

  async function loadDispatchData() {
    try {
      const [timelineResult, documentsResult, paymentsResult] = await Promise.all([
        supabase
          .from('dispatch_timeline')
          .select('*')
          .eq('dispatch_id', dispatch.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('documents')
          .select('*')
          .eq('dispatch_id', dispatch.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('payments')
          .select('*')
          .eq('dispatch_id', dispatch.id)
          .order('created_at', { ascending: false }),
      ]);

      if (timelineResult.error) throw timelineResult.error;
      if (documentsResult.error) throw documentsResult.error;
      if (paymentsResult.error) throw paymentsResult.error;

      setTimeline(timelineResult.data || []);
      setDocuments(documentsResult.data || []);
      setPayments(paymentsResult.data || []);
    } catch (error) {
      console.error('Error loading dispatch data:', error);
    } finally {
      setLoading(false);
    }
  }

  const getShipmentStep = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 1;
      case 'in_transit':
        return 2;
      case 'customs':
        return 3;
      case 'cleared':
        return 4;
      case 'completed':
        return 5;
      default:
        return 1;
    }
  };

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const paidPayments = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = totalPayments - paidPayments;

  async function handleDownloadDocument(doc: Document) {
    try {
      const { data, error } = await supabase.storage
        .from('dispatch-documents')
        .download(doc.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      alert(`Error al descargar documento: ${error.message}`);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-10 mb-6 border border-gray-200">
        <h2 className="text-3xl font-bold text-blue-600 mb-8 tracking-wide">ESTADO DE ENVÍO</h2>

        <div className="mb-8">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="bg-transparent rounded-xl p-5 border-2 border-blue-400 hover:border-blue-500 hover:bg-blue-50/30 transition-all">
              <p className="text-blue-600 font-semibold uppercase text-xs mb-2 tracking-wider">CLIENTE:</p>
              <p className="font-bold text-blue-700 text-lg">{dispatch.client.company_name}</p>
            </div>
            <div className="bg-transparent rounded-xl p-5 border-2 border-teal-400 hover:border-teal-500 hover:bg-teal-50/30 transition-all">
              <p className="text-teal-600 font-semibold uppercase text-xs mb-2 tracking-wider">MERCANCIA:</p>
              <p className="font-bold text-teal-700 text-lg">{dispatch.bl_number || 'N/A'}</p>
            </div>
            <div className="bg-transparent rounded-xl p-5 border-2 border-amber-400 hover:border-amber-500 hover:bg-amber-50/30 transition-all">
              <p className="text-amber-600 font-semibold uppercase text-xs mb-2 tracking-wider">ORDEN:</p>
              <p className="font-bold text-amber-700 text-lg">{dispatch.dispatch_number}</p>
            </div>
            <div className="bg-transparent rounded-xl p-5 border-2 border-green-400 hover:border-green-500 hover:bg-green-50/30 transition-all">
              <p className="text-green-600 font-semibold uppercase text-xs mb-2 tracking-wider">DESTINO:</p>
              <p className="font-bold text-green-700 text-lg">{dispatch.port || 'LIMA, PERÚ'}</p>
            </div>
          </div>
        </div>

        <ShipmentTracking currentStep={getShipmentStep(dispatch.status)} />
      </div>

      <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border border-gray-200">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-blue-600 mb-8 tracking-wide">ULTIMA ACTUALIZACIÓN</h3>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : timeline.length === 0 ? (
              <p className="text-slate-500 text-sm py-8">No hay actualizaciones aún</p>
            ) : (
              <div className="space-y-4">
                {timeline.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-start gap-4 border-l-4 border-blue-400 pl-6 pb-4 bg-blue-50 rounded-r-xl pr-4 py-4 hover:bg-blue-100 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <p className="text-sm text-slate-600 font-semibold">
                          {new Date(entry.created_at).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="text-base font-bold text-slate-800 mb-1">
                        {entry.status === 'pending' && 'En proceso de recepción aduanera'}
                        {entry.status === 'in_transit' && 'Mercancía en tránsito'}
                        {entry.status === 'customs' && 'En proceso de revisión aduanera'}
                        {entry.status === 'cleared' && 'Despacho liberado'}
                        {entry.status === 'completed' && 'Entregado'}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-slate-600">
                          Permiso para entrar/salir: Despacho total - {entry.notes}
                        </p>
                      )}
                    </div>
                    <button className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-md hover:shadow-lg">
                      VER MAS
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex-shrink-0">
            <div className="bg-amber-50 rounded-2xl p-7 border-2 border-amber-300 shadow-lg w-80">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-600 flex-shrink-0 mt-1" />
                <h4 className="font-bold text-amber-900 text-base">NO ES UN TRACKING</h4>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">
                LO QUE IMPRIMIMOS ES EL SEGUIMIENTO DE LOS MOVIMIENTOS EN EL PROCESO DE OBRA DESDE EL REGISTRO HASTA LA ENTREGA LA CARTA DE RECEPCIÓN DESDE LA UBICACIÓN O DESDE LA VÍA DESDE LA DOCUMENTACIÓN DE VÍA SUBIENDO EN EL REPOSITORIO
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-700 tracking-wide">Documentos</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <p className="text-slate-500 text-sm py-8">No hay documentos disponibles</p>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-5 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-lg transition-all border border-blue-200"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-6 h-6 text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {doc.file_name}
                      </p>
                      <p className="text-xs text-slate-600 capitalize">
                        {doc.document_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg flex-shrink-0"
                    title="Descargar documento"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs font-bold">Descargar</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-green-700 tracking-wide">Información de Pago</h3>
          </div>

          {loading ? (
            <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
          ) : payments.length === 0 ? (
            <p className="text-slate-500 text-sm py-8">No hay información de pago</p>
          ) : (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-6 p-6 bg-green-50 rounded-xl border border-green-200">
                <div>
                  <p className="text-xs text-green-600 font-semibold uppercase mb-2">Monto Total</p>
                  <p className="text-3xl font-bold text-slate-800">${totalPayments.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 font-semibold uppercase mb-2">Pagado</p>
                  <p className="text-3xl font-bold text-green-600">${paidPayments.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-green-600 font-semibold uppercase mb-2">Pendiente</p>
                  <p className="text-3xl font-bold text-amber-600">${pendingPayments.toFixed(2)}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Concepto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Monto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">
                        Vencimiento
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {payment.payment_type}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">
                          ${Number(payment.amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {payment.status === 'paid' ? 'PAGADO' : 'PENDIENTE'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {payment.due_date
                            ? new Date(payment.due_date).toLocaleDateString()
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
