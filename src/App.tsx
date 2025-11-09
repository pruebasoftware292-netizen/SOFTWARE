import { useAuth, AuthProvider } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { AdminDashboard } from './components/AdminDashboard';
import { ClientDashboard } from './components/ClientDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();

  console.log('AppContent render:', { user: !!user, profile, loading });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    console.log('Showing login form because:', { hasUser: !!user, hasProfile: !!profile });
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image copy copy copy copy copy.png')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-cyan-50/30 to-blue-100/40 backdrop-blur-[2px]"></div>
        <div className="relative z-10">
          <LoginForm />
        </div>
      </div>
    );
  }

  console.log('User authenticated, role:', profile.role);

  if (profile.role === 'admin') {
    return <AdminDashboard />;
  }

  return <ClientDashboard />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
