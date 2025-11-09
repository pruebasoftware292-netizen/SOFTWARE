import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Upload,
  FileText,
  Download,
  Clock,
  DollarSign,
  Plus,
} from 'lucide-react';
import { DocumentUploadModal } from './DocumentUploadModal';
import { PaymentFormModal } from './PaymentFormModal';
import type { Database } from '../../lib/database.types';

type Dispatch = Database['public']['Tables']['dispatches']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'];
};
type TimelineEntry = Database['public']['Tables']['dispatch_timeline']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

interface DispatchDetailProps {
  dispatch: Dispatch;
  onBack: () => void;
}

export function DispatchDetail({ dispatch: initialDispatch, onBack }: DispatchDetailProps) {
  const { user } = useAuth();
  const [dispatch, setDispatch] = useState(initialDispatch);
  const [editing, setEditing] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [formData, setFormData] = useState({
    dispatch_number: dispatch.dispatch_number,
    bl_number: dispatch.bl_number || '',
    supplier: dispatch.supplier || '',
    shipping_line: dispatch.shipping_line || '',
    arrival_date: dispatch.arrival_date || '',
    channel: dispatch.channel || 'pending',
    status: dispatch.status,
    container_number: dispatch.container_number || '',
    port: dispatch.port || '',
    weight: dispatch.weight || 0,
    value: dispatch.value || 0,
  });
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    document_type: 'invoice' as string,
    file_name: '',
    notes: '',
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    payment_type: '',
    due_date: '',
    notes: '',
  });

  useEffect(() => {
    loadTimeline();
    loadDocuments();
    loadPayments();
  }, [dispatch.id]);

  async function loadTimeline() {
    try {
      const { data, error } = await supabase
        .from('dispatch_timeline')
        .select('*')
        .eq('dispatch_id', dispatch.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTimeline(data || []);
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  }

  async function loadDocuments() {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('dispatch_id', dispatch.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  }

  async function loadPayments() {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('dispatch_id', dispatch.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  }

  async function handleUpdate() {
    try {
      const { error } = await supabase
        .from('dispatches')
        .update(formData)
        .eq('id', dispatch.id);

      if (error) throw error;

      setDispatch({ ...dispatch, ...formData });
      setEditing(false);

      const { data: clientData } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', dispatch.client_id)
        .maybeSingle();

      if (clientData?.user_id) {
        await supabase.from('notifications').insert({
          user_id: clientData.user_id,
          dispatch_id: dispatch.id,
          type: 'dispatch_updated',
          title: 'Dispatch Updated',
          message: `Dispatch ${dispatch.dispatch_number} has been updated`,
        });
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  async function handleStatusUpdate() {
    if (!newStatus) return;

    try {
      const { error: timelineError } = await supabase
        .from('dispatch_timeline')
        .insert({
          dispatch_id: dispatch.id,
          status: newStatus,
          notes: statusNotes,
          updated_by: user!.id,
        });

      if (timelineError) throw timelineError;

      const { error: dispatchError } = await supabase
        .from('dispatches')
        .update({ status: newStatus })
        .eq('id', dispatch.id);

      if (dispatchError) throw dispatchError;

      setDispatch({ ...dispatch, status: newStatus });
      setNewStatus('');
      setStatusNotes('');
      loadTimeline();

      const { data: clientData } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', dispatch.client_id)
        .maybeSingle();

      if (clientData?.user_id) {
        await supabase.from('notifications').insert({
          user_id: clientData.user_id,
          dispatch_id: dispatch.id,
          type: 'status_updated',
          title: 'Status Updated',
          message: `Dispatch ${dispatch.dispatch_number} status changed to ${newStatus}`,
        });
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  const statusOptions = [
    'pending',
    'documentation',
    'in_transit',
    'arrived',
    'customs',
    'inspection',
    'released',
    'delivery',
    'completed',
  ];

  async function getClientUserId() {
    const { data } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', dispatch.client_id)
      .maybeSingle();
    return data?.user_id || null;
  }

  async function handleDocumentSuccess() {
    loadDocuments();
  }

  async function handlePaymentSuccess() {
    loadPayments();
  }

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
    <div>
      {showDocumentUpload && (
        <DocumentUploadModal
          dispatchId={dispatch.id}
          dispatchNumber={dispatch.dispatch_number}
          clientUserId={null}
          onClose={() => setShowDocumentUpload(false)}
          onSuccess={handleDocumentSuccess}
        />
      )}

      {showPaymentForm && (
        <PaymentFormModal
          dispatchId={dispatch.id}
          dispatchNumber={dispatch.dispatch_number}
          clientUserId={null}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dispatches
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {dispatch.dispatch_number}
            </h2>
            <p className="text-gray-600">Client: {dispatch.client.company_name}</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    dispatch_number: dispatch.dispatch_number,
                    bl_number: dispatch.bl_number || '',
                    supplier: dispatch.supplier || '',
                    shipping_line: dispatch.shipping_line || '',
                    arrival_date: dispatch.arrival_date || '',
                    channel: dispatch.channel || 'pending',
                    status: dispatch.status,
                    container_number: dispatch.container_number || '',
                    port: dispatch.port || '',
                    weight: dispatch.weight || 0,
                    value: dispatch.value || 0,
                  });
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {editing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dispatch Number
                </label>
                <input
                  type="text"
                  value={formData.dispatch_number}
                  onChange={(e) => setFormData({ ...formData, dispatch_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BL Number</label>
                <input
                  type="text"
                  value={formData.bl_number}
                  onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Line
                </label>
                <input
                  type="text"
                  value={formData.shipping_line}
                  onChange={(e) => setFormData({ ...formData, shipping_line: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arrival Date
                </label>
                <input
                  type="date"
                  value={formData.arrival_date}
                  onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="green">Green</option>
                  <option value="orange">Orange</option>
                  <option value="red">Red</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                <input
                  type="text"
                  value={formData.port}
                  onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Container Number
                </label>
                <input
                  type="text"
                  value={formData.container_number}
                  onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </>
          ) : (
            <>
              {dispatch.bl_number && (
                <div>
                  <p className="text-sm text-gray-500">BL Number</p>
                  <p className="font-medium text-gray-900">{dispatch.bl_number}</p>
                </div>
              )}
              {dispatch.supplier && (
                <div>
                  <p className="text-sm text-gray-500">Supplier</p>
                  <p className="font-medium text-gray-900">{dispatch.supplier}</p>
                </div>
              )}
              {dispatch.shipping_line && (
                <div>
                  <p className="text-sm text-gray-500">Shipping Line</p>
                  <p className="font-medium text-gray-900">{dispatch.shipping_line}</p>
                </div>
              )}
              {dispatch.arrival_date && (
                <div>
                  <p className="text-sm text-gray-500">Arrival Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(dispatch.arrival_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              {dispatch.channel && (
                <div>
                  <p className="text-sm text-gray-500">Channel</p>
                  <p className="font-medium text-gray-900 capitalize">{dispatch.channel}</p>
                </div>
              )}
              {dispatch.port && (
                <div>
                  <p className="text-sm text-gray-500">Port</p>
                  <p className="font-medium text-gray-900">{dispatch.port}</p>
                </div>
              )}
              {dispatch.container_number && (
                <div>
                  <p className="text-sm text-gray-500">Container</p>
                  <p className="font-medium text-gray-900">{dispatch.container_number}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium text-gray-900 capitalize">
                  {dispatch.status.replace('_', ' ')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            >
              <option value="">Select new status...</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ').toUpperCase()}
                </option>
              ))}
            </select>
            <textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Add notes (optional)..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2"
            />
            <button
              onClick={handleStatusUpdate}
              disabled={!newStatus}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Status Update
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {timeline.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No timeline entries yet</p>
            ) : (
              timeline.map((entry) => (
                <div key={entry.id} className="border-l-2 border-blue-500 pl-4 py-2">
                  <p className="font-medium text-gray-900 capitalize">
                    {entry.status.replace('_', ' ')}
                  </p>
                  {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
            </div>
            <button
              onClick={() => setShowDocumentUpload(true)}
              className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {documents.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No documents uploaded yet</p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.file_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{doc.document_type}</p>
                      {doc.notes && (
                        <p className="text-xs text-gray-400 mt-1">{doc.notes}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadDocument(doc)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
                    title="Descargar documento"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Descargar</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
            </div>
            <button
              onClick={() => setShowPaymentForm(true)}
              className="flex items-center gap-2 text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Payment
            </button>
          </div>

          {payments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">No payments recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.payment_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {payment.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.due_date
                          ? new Date(payment.due_date).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
