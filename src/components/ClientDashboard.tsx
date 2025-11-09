import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Package,
  Bell,
  LogOut,
  LayoutDashboard,
  MapPin,
  Ship,
} from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { ClientDispatchDetail } from './client/ClientDispatchDetail';
import { TrackingProcessDiagram } from './client/TrackingProcessDiagram';
import type { Database } from '../lib/database.types';

type Dispatch = Database['public']['Tables']['dispatches']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'];
};

export function ClientDashboard() {
  const { signOut, profile, user } = useAuth();
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tracking'>('dashboard');

  useEffect(() => {
    if (user) {
      loadDispatches();
    }
  }, [user]);

  async function loadDispatches() {
    try {
      const { data: clientData } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (!clientData) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('dispatches')
        .select(`
          *,
          client:clients(*)
        `)
        .eq('client_id', clientData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDispatches(data as any);
    } catch (error) {
      console.error('Error loading dispatches:', error);
    } finally {
      setLoading(false);
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

  const getChannelColor = (channel: string | null) => {
    switch (channel) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracking', label: 'Seguimiento', icon: MapPin },
  ];

  if (currentView === 'tracking' || selectedDispatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
        <nav className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <Ship className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Logística</span>
                    <span className="text-gray-800"> broker</span>
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">Portal de Cliente</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">BUSCAR</span>
                </button>

                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                >
                  <Bell className="w-5 h-5" />
                </button>

                <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{profile?.full_name}</p>
                    <p className="text-xs text-gray-500 capitalize font-medium">Cliente</p>
                  </div>
                </div>

                <button
                  onClick={() => signOut()}
                  className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          <aside className="w-72 bg-white border-r border-gray-200 min-h-[calc(100vh-5rem)] shadow-sm">
            <nav className="p-6 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'dashboard') {
                      setCurrentView('dashboard');
                      setSelectedDispatch(null);
                    }
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 ${
                    item.id === 'tracking'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/30 scale-105'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-gray-800 font-semibold'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          <div className="flex-1">

            {showNotifications && (
              <div className="fixed top-20 right-4 z-50 w-96 max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                <NotificationPanel onClose={() => setShowNotifications(false)} />
              </div>
            )}

            <main className="p-8 overflow-auto">
              {selectedDispatch ? (
                <ClientDispatchDetail
                  dispatch={selectedDispatch}
                  onBack={() => {
                    setSelectedDispatch(null);
                    setCurrentView('tracking');
                  }}
                />
              ) : (
                <div>
                  <div className="mb-8">
                    <h2 className="text-4xl font-bold text-gray-800">Seguimiento</h2>
                    <p className="text-gray-500 mt-2 text-lg">Visualiza el proceso de despacho aduanero</p>
                  </div>
                  <div className="space-y-6">
                    {dispatches.length > 0 && (
                      <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">Selecciona un despacho para ver el detalle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {dispatches.map((dispatch) => (
                            <button
                              key={dispatch.id}
                              onClick={() => setSelectedDispatch(dispatch)}
                              className="group bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border border-blue-200 hover:border-blue-300 rounded-2xl p-5 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <p className="font-bold text-gray-900 text-lg">{dispatch.dispatch_number}</p>
                                <MapPin className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                              </div>
                              {dispatch.bl_number && (
                                <p className="text-sm text-gray-600 font-medium">BL: {dispatch.bl_number}</p>
                              )}
                              <p className="text-xs text-gray-500 mt-2 uppercase font-semibold">
                                Estado: {dispatch.status.replace('_', ' ')}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <TrackingProcessDiagram />
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
      <nav className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Ship className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Logística</span>
                  <span className="text-gray-800"> broker</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium">Portal de Cliente</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">BUSCAR</span>
              </button>

              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
              </button>

              <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize font-medium">Cliente</p>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-72 bg-white border-r border-gray-200 min-h-[calc(100vh-5rem)] shadow-sm">
          <nav className="p-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'tracking') {
                    setCurrentView('tracking');
                    if (dispatches.length > 0) {
                      setSelectedDispatch(dispatches[0]);
                    }
                  } else {
                    setCurrentView('dashboard');
                  }
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 ${
                  (item.id === 'dashboard' && currentView === 'dashboard')
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/30 scale-105'
                    : (item.id === 'tracking' && currentView === 'tracking')
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow-lg shadow-blue-500/30 scale-105'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-gray-800 font-semibold'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-1">
          {showNotifications && (
            <div className="fixed top-20 right-4 z-50 w-96 max-h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            </div>
          )}

          <main className="p-8 overflow-auto">
            <div className="mb-8">
              <h2 className="text-4xl font-bold text-gray-800">Mis Despachos</h2>
              <p className="text-gray-500 mt-2 text-lg">Rastrea tus despachos aduaneros y visualiza documentos</p>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-3xl shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : dispatches.length === 0 ? (
              <div className="bg-white rounded-3xl shadow-md p-16 text-center border border-gray-100">
                <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No hay despachos aún</h3>
                <p className="text-gray-500 text-lg">Tus despachos aduaneros aparecerán aquí</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {dispatches.map((dispatch) => (
                  <div
                    key={dispatch.id}
                    className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-8 cursor-pointer border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
                    onClick={() => setSelectedDispatch(dispatch)}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-2xl font-bold text-gray-900">
                            {dispatch.dispatch_number}
                          </h3>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${getStatusColor(dispatch.status)}`}>
                            {dispatch.status.replace('_', ' ')}
                          </span>
                          {dispatch.channel && (
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${getChannelColor(dispatch.channel)}`}>
                              {dispatch.channel}
                            </span>
                          )}
                        </div>
                        {dispatch.bl_number && (
                          <p className="text-base text-gray-600 font-medium">BL: {dispatch.bl_number}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                      {dispatch.supplier && (
                        <div>
                          <p className="text-gray-500 font-semibold uppercase text-xs mb-1">Proveedor</p>
                          <p className="font-bold text-gray-900 text-base">{dispatch.supplier}</p>
                        </div>
                      )}
                      {dispatch.shipping_line && (
                        <div>
                          <p className="text-gray-500 font-semibold uppercase text-xs mb-1">Línea Naviera</p>
                          <p className="font-bold text-gray-900 text-base">{dispatch.shipping_line}</p>
                        </div>
                      )}
                      {dispatch.arrival_date && (
                        <div>
                          <p className="text-gray-500 font-semibold uppercase text-xs mb-1">Fecha de Llegada</p>
                          <p className="font-bold text-gray-900 text-base">
                            {new Date(dispatch.arrival_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {dispatch.port && (
                        <div>
                          <p className="text-gray-500 font-semibold uppercase text-xs mb-1">Puerto</p>
                          <p className="font-bold text-gray-900 text-base">{dispatch.port}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
