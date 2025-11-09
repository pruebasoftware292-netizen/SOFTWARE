import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Attempting login with:', email);
      const { error } = await signIn(email, password);
      console.log('Login result:', { error });
      if (error) {
        console.error('Login error:', error);
        setError('Credenciales inválidas. Por favor, intenta de nuevo.');
      } else {
        console.log('Login successful!');
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setError('No se pudo enviar el correo de restablecimiento. Verifica tu dirección de correo.');
      } else {
        setSuccess('¡Correo de restablecimiento enviado! Por favor, revisa tu bandeja de entrada.');
        setTimeout(() => setShowResetPassword(false), 3000);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { error } = await signUp(email, password, fullName, 'admin');
      if (error) {
        setError(error.message || 'No se pudo crear la cuenta. Por favor, intenta de nuevo.');
      } else {
        setSuccess('¡Cuenta creada exitosamente! Ya puedes iniciar sesión.');
        setTimeout(() => {
          setShowSignUp(false);
          setEmail('');
          setPassword('');
          setFullName('');
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  }

  if (showSignUp) {
    return (
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Registro de Administrador</h2>
          <p className="text-gray-600 mt-2">Solo para personal administrativo</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-in fade-in duration-200">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-5">
          <div>
            <label htmlFor="signup-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              id="signup-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Mínimo 6 caracteres</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            {loading ? 'Creando Cuenta...' : 'Registrar Administrador'}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowSignUp(false);
              setError('');
              setSuccess('');
            }}
            className="w-full text-green-600 hover:text-green-700 text-sm font-semibold py-2 transition-colors"
          >
            Volver al Inicio de Sesión
          </button>
        </form>
      </div>
    );
  }

  if (showResetPassword) {
    return (
      <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Restablecer Contraseña</h2>
          <p className="text-gray-600 mt-2">Ingresa tu correo para recibir un enlace de restablecimiento</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-in fade-in duration-200">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="tucorreo@ejemplo.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
          >
            {loading ? 'Enviando...' : 'Enviar Enlace de Restablecimiento'}
          </button>

          <button
            type="button"
            onClick={() => setShowResetPassword(false)}
            className="w-full text-blue-600 hover:text-blue-700 text-sm font-semibold py-2 transition-colors"
          >
            Volver al Inicio de Sesión
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-10 border border-white/20">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center gap-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Logística</span>
            <span className="text-gray-800"> broker</span>
          </h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">INICIO DE SESIÓN</h2>
        <p className="text-gray-600 text-base">Por favor, ingrese sus datos</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2">
            Usuario/Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-2">
            Contraseña
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-base py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {loading ? 'INGRESANDO...' : 'CONTINUAR'}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowResetPassword(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            ¿Olvidó su contraseña?
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            ¿Eres administrador y no tienes cuenta?{' '}
            <button
              type="button"
              onClick={() => setShowSignUp(true)}
              className="text-green-600 hover:text-green-700 font-semibold transition-colors hover:underline"
            >
              Registrarse como Admin
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Use</a>
            <span className="text-gray-400">•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </form>
    </div>
  );
}
