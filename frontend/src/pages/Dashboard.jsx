import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { apiGetDashboard } from '../services/api';
import TarjetaResumen from '../components/TarjetaResumen';
import { formatMonto, formatFecha, COLORES_GRAFICO } from '../utils/formatear';

export default function Dashboard() {
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await apiGetDashboard();
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  if (cargando) return <div style={{ padding: '40px', color: '#94A3B8' }}>Cargando...</div>;
  if (!data)    return null;

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.5rem', fontWeight: 700 }}>Dashboard</h1>
        <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.88rem' }}>Resumen del mes actual</p>
      </div>

      {/* Tarjetas */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <TarjetaResumen titulo="Hoy"    monto={data.totalHoy}    icono="📅" subtitulo="gasto del dia" />
        <TarjetaResumen titulo="Semana" monto={data.totalSemana} icono="📆" subtitulo="desde el lunes" color="#3B82F6" />
        <TarjetaResumen titulo="Mes"    monto={data.totalMes}    icono="🗓️" subtitulo="mes en curso"   color="#10B981" />
      </div>

      {/* Graficos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Torta categorias */}
        <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', color: '#F7FAFC', fontSize: '0.95rem', fontWeight: 600 }}>Por Categoria</h3>
          {data.porCategoria.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>Sin datos este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.porCategoria} dataKey="total" nameKey="nombre" cx="50%" cy="50%" outerRadius={80} label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {data.porCategoria.map((_, i) => (
                    <Cell key={i} fill={COLORES_GRAFICO[i % COLORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMonto(v)} contentStyle={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '8px', color: '#F7FAFC' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Barras cajas */}
        <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 16px', color: '#F7FAFC', fontSize: '0.95rem', fontWeight: 600 }}>Por Caja</h3>
          {data.porCaja.length === 0 ? (
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '40px 0' }}>Sin datos este mes</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.porCaja} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                <XAxis dataKey="nombre" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => formatMonto(v)} contentStyle={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '8px', color: '#F7FAFC' }} />
                <Bar dataKey="total" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Ultimos movimientos */}
      <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ margin: '0 0 16px', color: '#F7FAFC', fontSize: '0.95rem', fontWeight: 600 }}>Ultimos movimientos</h3>
        {data.ultimosMovimientos.length === 0 ? (
          <p style={{ color: '#94A3B8', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
            No hay gastos cargados aun.{' '}
            <span style={{ color: '#F97316', cursor: 'pointer' }} onClick={() => navigate('/nuevo-gasto')}>Cargar primero</span>
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2D3748' }}>
                  {['Fecha', 'Descripcion', 'Categoria', 'Caja', 'Metodo', 'Monto'].map(h => (
                    <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: '#64748B', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.ultimosMovimientos.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #1E2333' }}>
                    <td style={tdStyle}>{formatFecha(g.fecha)}</td>
                    <td style={{ ...tdStyle, color: '#F7FAFC', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.descripcion || '-'}</td>
                    <td style={tdStyle}><Badge texto={g.categoria_nombre} color="#3B82F6" /></td>
                    <td style={tdStyle}><Badge texto={g.caja_nombre} color="#8B5CF6" /></td>
                    <td style={tdStyle}>{g.metodo_pago || '-'}</td>
                    <td style={{ ...tdStyle, color: '#F97316', fontWeight: 600 }}>{formatMonto(g.monto)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const tdStyle = { padding: '10px 12px', color: '#94A3B8', verticalAlign: 'middle' };

function Badge({ texto, color }) {
  if (!texto) return <span style={{ color: '#4A5568' }}>-</span>;
  return (
    <span style={{
      background: `${color}20`, color: color,
      padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500,
    }}>{texto}</span>
  );
}
