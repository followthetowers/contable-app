import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const nav = [
  { to: '/',             label: 'Dashboard',    icon: '📊' },
  { to: '/nuevo-gasto',  label: 'Nuevo Gasto',  icon: '➕' },
  { to: '/movimientos',  label: 'Movimientos',  icon: '📋' },
  { to: '/reportes',     label: 'Reportes',     icon: '📈' },
];

export default function Sidebar() {
  const { logout, usuario } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside style={{ width: '220px', minHeight: '100vh', background: '#1A1D27', borderRight: '1px solid #2D3748', display: 'flex', flexDirection: 'column', padding: '0', flexShrink: 0 }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 24px', borderBottom: '1px solid #2D3748' }}>
        <div style={{ color: '#F97316', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          💰 Contable
        </div>
        <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '4px' }}>
          Control Financiero
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '11px 14px',
              borderRadius: '8px',
              marginBottom: '4px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#F97316' : '#94A3B8',
              background: isActive ? 'rgba(249,115,22,0.1)' : 'transparent',
              transition: 'all 0.15s',
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer usuario */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid #2D3748' }}>
        <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginBottom: '10px', paddingLeft: '4px' }}>
          👤 {usuario}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '10px', borderRadius: '8px',
            background: 'transparent', border: '1px solid #2D3748',
            color: '#94A3B8', cursor: 'pointer', fontSize: '0.85rem',
            transition: 'all 0.15s',
          }}
          onMouseOver={e => { e.target.style.borderColor = '#EF4444'; e.target.style.color = '#EF4444'; }}
          onMouseOut={e => { e.target.style.borderColor = '#2D3748'; e.target.style.color = '#94A3B8'; }}
        >
          Cerrar sesion
        </button>
      </div>
    </aside>
  );
}
