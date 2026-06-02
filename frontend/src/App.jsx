import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar    from './components/Sidebar';
import Login      from './pages/Login';
import Dashboard  from './pages/Dashboard';
import NuevoGasto from './pages/NuevoGasto';
import Movimientos from './pages/Movimientos';
import Reportes   from './pages/Reportes';

function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0F1117' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', minHeight: '100vh' }}>
        <Outlet />
      </main>
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
