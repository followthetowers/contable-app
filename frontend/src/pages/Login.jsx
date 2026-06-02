import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiLogin } from '../services/api';

export default function Login() {
  const [usuario,  setUsuario]  = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [cargando, setCargando] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usuario || !password) { setError('Completá usuario y contraseña.'); return; }
    setCargando(true);
    setError('');
    try {
      const res = await apiLogin(usuario, password);
      login(res.data.token, res.data.usuario);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Error de conexion. Verificá que el servidor esté corriendo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0F1117',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '20px',
        padding: '48px 40px', width: '100%', maxWidth: '400px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '2.8rem', marginBottom: '10px' }}>💰</div>
          <h1 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.6rem', fontWeight: 700 }}>
            Control Financiero
          </h1>
          <p style={{ margin: '8px 0 0', color: '#94A3B8', fontSize: '0.88rem' }}>
            Ingresá a tu cuenta
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '8px', padding: '12px 14px', marginBottom: '20px',
            color: '#FCA5A5', fontSize: '0.85rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.82rem', marginBottom: '7px', fontWeight: 500 }}>
              Usuario
            </label>
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="admin"
              autoFocus
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck="false"
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#94A3B8', fontSize: '0.82rem', marginBottom: '7px', fontWeight: 500 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            style={{
              marginTop: '8px', padding: '14px', borderRadius: '10px',
              background: cargando ? '#94A3B8' : '#F97316',
              border: 'none', color: '#fff', fontWeight: 700, fontSize: '1rem',
              cursor: cargando ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#4A5568', fontSize: '0.75rem', marginTop: '24px' }}>
          usuario: admin · contraseña: admin123
        </p>
      </div>
    </div>
  );
}
