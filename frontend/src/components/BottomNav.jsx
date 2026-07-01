import { NavLink } from 'react-router-dom';

const nav = [
  { to: '/',            label: 'Dashboard',   icon: '📊' },
  { to: '/nuevo-gasto', label: 'Nuevo',       icon: '➕' },
  { to: '/movimientos', label: 'Movimientos', icon: '📋' },
  { to: '/almanaque',   label: 'Almanaque',   icon: '📅' },
  { to: '/reportes',    label: 'Reportes',    icon: '📈' },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#1A1D27', borderTop: '1px solid #2D3748',
      padding: '6px 0', zIndex: 100,
      justifyContent: 'space-around', alignItems: 'center',
    }}>
      {nav.map(({ to, label, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '2px', padding: '6px 10px', textDecoration: 'none',
            color: isActive ? '#F97316' : '#94A3B8',
            fontSize: '0.65rem', fontWeight: isActive ? 600 : 400,
          })}
        >
          <span style={{ fontSize: '1.4rem' }}>{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
