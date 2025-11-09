import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Package,
  Users,
  TrendingUp,
  Clock,
  Bell,
  Calendar,
  FileText,
  DollarSign,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { ClientManagement } from './admin/ClientManagement';
import { DispatchManagement } from './admin/DispatchManagement';
import { CalendarView } from './admin/CalendarView';
import { NotificationPanel } from './NotificationPanel';

interface DashboardStats {
  totalDispatches: number;
  activeDispatches: number;
  totalClients: number;
  pendingPayments: number;
}

interface DispatchStatusData {
  status: string;
  count: number;
  color: string;
  label: string;
}

export function AdminDashboard() {
  const { signOut, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDispatches: 0,
    activeDispatches: 0,
    totalClients: 0,
    pendingPayments: 0,
  });
  const [activeView, setActiveView] = useState<'dashboard' | 'clients' | 'dispatches' | 'calendar'>('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<DispatchStatusData[]>([]);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [dispatchesResult, clientsResult, paymentsResult] = await Promise.all([
        supabase.from('dispatches').select('status', { count: 'exact', head: true }),
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('payments').select('status', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const activeDispatches = await supabase
        .from('dispatches')
        .select('id', { count: 'exact', head: true })
        .neq('status', 'completed');

      const { data: dispatchesByStatus } = await supabase
        .from('dispatches')
        .select('status');

      const statusMap: { [key: string]: { label: string; color: string } } = {
        pending: { label: 'Pendiente', color: 'bg-yellow-500' },
        in_progress: { label: 'En Proceso', color: 'bg-blue-500' },
        completed: { label: 'Completado', color: 'bg-green-500' },
        cancelled: { label: 'Cancelado', color: 'bg-red-500' },
      };

      const statusCounts = dispatchesByStatus?.reduce((acc: any, dispatch) => {
        acc[dispatch.status] = (acc[dispatch.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const chartData = Object.entries(statusMap).map(([status, info]) => ({
        status,
        count: statusCounts[status] || 0,
        color: info.color,
        label: info.label,
      }));

      setStatusData(chartData);
      setStats({
        totalDispatches: dispatchesResult.count || 0,
        activeDispatches: activeDispatches.count || 0,
        totalClients: clientsResult.count || 0,
        pendingPayments: paymentsResult.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }

  const navigation = [
    { id: 'dashboard', label: 'Panel Principal', icon: TrendingUp },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'dispatches', label: 'Despachos', icon: Package },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
  ];

  const statCards = [
    {
      title: 'Total de Despachos',
      value: stats.totalDispatches,
      icon: Package,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Despachos Activos',
      value: stats.activeDispatches,
      icon: Clock,
      color: 'bg-gradient-to-br from-amber-500 to-amber-600',
    },
    {
      title: 'Total de Clientes',
      value: stats.totalClients,
      icon: Users,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      title: 'Pagos Pendientes',
      value: stats.pendingPayments,
      icon: DollarSign,
      color: 'bg-gradient-to-br from-red-500 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/40">
      <nav className="bg-white border-b border-gray-200 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Logística</span>
                  <span className="text-gray-800"> broker</span>
                </h1>
                <p className="text-xs text-gray-500 font-medium">Panel de Administrador</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
              >
                <Bell className="w-5 h-5" />
              </button>

              <div className="hidden md:flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{profile?.full_name}</p>
                  <p className="text-xs text-gray-500 capitalize font-medium">Admin</p>
                </div>
              </div>

              <button
                onClick={() => signOut()}
                className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showNotifications && (
        <div className="fixed top-16 right-4 z-50 w-96 max-h-[calc(100vh-5rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          <NotificationPanel onClose={() => setShowNotifications(false)} />
        </div>
      )}

      <div className="flex">
        <aside className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block w-72 bg-white border-r border-gray-200 min-h-[calc(100vh-5rem)] shadow-sm`}>
          <nav className="p-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as any);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 ${
                  activeView === item.id
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

        <main className="flex-1 p-8">
          {activeView === 'dashboard' && (
            <div>
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-800">Resumen General</h2>
                <p className="text-gray-500 mt-2 text-lg">Estadísticas principales del sistema</p>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statCards.map((card) => (
                      <div key={card.title} className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200 hover:-translate-y-1">
                        <div className="p-7">
                          <div className="flex items-center justify-between mb-5">
                            <div className={`${card.color} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              <card.icon className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <p className="text-gray-500 text-sm font-semibold mb-3 uppercase tracking-wide">{card.title}</p>
                          <p className="text-5xl font-bold text-gray-800">{card.value}</p>
                        </div>
                        <div className={`h-1.5 ${card.color}`}></div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-3xl shadow-md p-10 border border-gray-100">
                    <div className="mb-8">
                      <h3 className="text-3xl font-bold text-gray-800">Estado de Despachos</h3>
                      <p className="text-gray-500 mt-2 text-lg">Distribución por estado actual</p>
                    </div>

                    <div className="space-y-7">
                      {statusData.map((item) => {
                        const total = statusData.reduce((sum, d) => sum + d.count, 0);
                        const percentage = total > 0 ? (item.count / total) * 100 : 0;

                        return (
                          <div key={item.status} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`${item.color} w-5 h-5 rounded-full shadow-md`}></div>
                                <span className="text-gray-700 font-bold text-lg">{item.label}</span>
                              </div>
                              <div className="flex items-center gap-5">
                                <span className="text-3xl font-bold text-gray-800">{item.count}</span>
                                <span className="text-base text-gray-500 w-20 text-right font-semibold">
                                  {percentage.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                              <div
                                className={`${item.color} h-full rounded-full transition-all duration-500 ease-out shadow-sm`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}

                      {statusData.reduce((sum, d) => sum + d.count, 0) === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-semibold">No hay despachos registrados</p>
                          <p className="text-sm mt-2">Los despachos aparecerán aquí una vez creados</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeView === 'clients' && <ClientManagement />}
          {activeView === 'dispatches' && <DispatchManagement />}
          {activeView === 'calendar' && <CalendarView />}
        </main>
      </div>
    </div>
  );
}
