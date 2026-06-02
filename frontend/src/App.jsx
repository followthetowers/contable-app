import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar     from './components/Sidebar';
import Login       from './pages/Login';
import Dashboard   from './pages/Dashboard';
import NuevoGasto  from './pages/NuevoGasto';
import Movimientos from './pages/Movimientos';
import Reportes    from './pages/Reportes';

function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F1117' }}>
      {menuAbierto && (
        <div className="mobile-overlay" onClick={() => setMenuAbierto(false)} />
      )}

      <Sidebar menuAbierto={menuAbierto} cerrarMenu={() => setMenuAbierto(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header className="mobile-header">
          <button
            onClick={() => setMenuAbierto(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: '#F7FAFC' }}
          >
            <div style={{ width: 22, height: 2, background: 'currentColor', marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: 'currentColor', marginBottom: 5 }} />
            <div style={{ width: 22, height: 2, background: 'currentColor' }} />
          </button>
          <span style={{ color: '#F97316', fontWeight: 800, fontSize: '1.1rem' }}>💰 Contable</span>
          <div style={{ width: 34 }} />
        </header>

        <main className="main-content" style={{ flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute() {
  const { estaLogueado } = useAuth();
  return estaLogueado ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/"             element={<Dashboard />} />
              <Route path="/nuevo-gasto"  element={<NuevoGasto />} />
              <Route path="/movimientos"  element={<Movimientos />} />
              <Route path="/reportes"     element={<Reportes />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
