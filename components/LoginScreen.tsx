
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-background-dark p-4">
      <div className="w-full max-w-sm futuristic-panel text-center">
        <h1 className="text-2xl font-black uppercase text-glow-cyan tracking-widest mb-2">
          SUPER ADMIN 1.0
        </h1>
        <p className="text-text-secondary mb-6">Ingresa tu email y contraseña para iniciar sesión.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="futuristic-input w-full rounded-md p-3 text-center"
            placeholder="Tu Email"
            required
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="futuristic-input w-full rounded-md p-3 text-center"
            placeholder="Tu Contraseña"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full futuristic-button font-bold py-3 px-6 rounded-lg"
            disabled={!email.trim() || !password.trim() || loading}
          >
            {loading ? 'Iniciando sesión...' : 'Acceder al Diario'}
          </button>
        </form>
         <div className="text-center text-xs text-gray-600 pt-4 mt-4 border-t border-border-color">
            <p>&copy; 2024 Visual AI Journal</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
