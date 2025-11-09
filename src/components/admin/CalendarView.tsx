import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Plus, X, Save } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row'];

export function CalendarView() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    event_type: 'deadline',
  });

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { error } = await supabase.from('calendar_events').insert({
        ...formData,
        created_by: user!.id,
      });

      if (error) throw error;

      resetForm();
      loadEvents();
    } catch (error: any) {
      alert(error.message);
    }
  }

  function resetForm() {
    setFormData({
      title: '',
      description: '',
      event_date: '',
      event_type: 'deadline',
    });
    setShowForm(false);
  }

  const upcomingEvents = events.filter(
    (e) => new Date(e.event_date) >= new Date()
  );
  const pastEvents = events.filter(
    (e) => new Date(e.event_date) < new Date()
  );

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'deadline':
        return 'Fecha Límite';
      case 'meeting':
        return 'Reunión';
      case 'inspection':
        return 'Inspección';
      case 'delivery':
        return 'Entrega';
      case 'other':
        return 'Otro';
      default:
        return type;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Calendario</h2>
          <p className="text-gray-600 mt-1">Gestiona eventos y fechas importantes</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Nuevo Evento
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Nuevo Evento</h3>
              <button onClick={resetForm} className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título del Evento *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha y Hora *
                </label>
                <input
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo de Evento *
                </label>
                <select
                  value={formData.event_type}
                  onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="deadline">Fecha Límite</option>
                  <option value="meeting">Reunión</option>
                  <option value="inspection">Inspección</option>
                  <option value="delivery">Entrega</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  <Save className="w-5 h-5" />
                  Crear Evento
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse border border-gray-100">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Próximos Eventos</h3>
            {upcomingEvents.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No hay eventos próximos</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-lg font-bold text-gray-900">{event.title}</h4>
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 text-xs font-bold rounded-full">
                            {getEventTypeLabel(event.event_type)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-gray-600 mb-3">{event.description}</p>
                        )}
                        <p className="text-sm text-gray-500 font-medium">
                          {new Date(event.event_date).toLocaleString('es-ES', {
                            dateStyle: 'full',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pastEvents.length > 0 && (
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Eventos Pasados</h3>
              <div className="grid gap-4">
                {pastEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow-lg p-6 opacity-60 border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="text-lg font-semibold text-gray-700">{event.title}</h4>
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                            {getEventTypeLabel(event.event_type)}
                          </span>
                        </div>
                        {event.description && (
                          <p className="text-gray-500 mb-3">{event.description}</p>
                        )}
                        <p className="text-sm text-gray-400 font-medium">
                          {new Date(event.event_date).toLocaleString('es-ES', {
                            dateStyle: 'full',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
