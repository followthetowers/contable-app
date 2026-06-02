import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiGetResumen } from '../services/api';
import { formatMonto, fechaHoy } from '../utils/formatear';

const getMesActual = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-01`;
};

export default function Reportes() {
  const [data,     setData]     = useState(null);
  const [cargando, setCargando] = useState(true);
  const [desde,    setDesde]    = useState(getMesActual());
  const [hasta,    setHasta]    = useState(fechaHoy());
  const navigate = useNavigate();

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await apiGetResumen({ desde, hasta });
      setData(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, [desde, hasta]);

  const exportarCSV = () => {
    const token = localStorage.getItem('token');
    window.open(`/api/reportes/exportar?desde=${desde}&hasta=${hasta}&token=${token}`, '_blank');
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.5rem', fontWeight: 700 }}>Reportes</h1>
          <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.88rem' }}>Resumen por periodo</p>
        </div>
        <button onClick={exportarCSV} style={{ padding: '10px 20px', borderRadius: '8px', background: '#10B981', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.88rem' }}>
          Exportar CSV
        </button>
      </div>

      {/* Selector de rango */}
      <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={labelStyle}>Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} style={{ width: '160px' }} />
        </div>
        <div>
          <label style={labelStyle}>Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} style={{ width: '160px' }} />
        </div>
        {data && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginBottom: '4px' }}>Total del periodo</div>
            <div style={{ color: '#F97316', fontSize: '1.6rem', fontWeight: 700 }}>{formatMonto(data.totalGeneral)}</div>
          </div>
        )}
      </div>

      {cargando ? (
        <div style={{ color: '#94A3B8', padding: '40px', textAlign: 'center' }}>Cargando...</div>
      ) : !data ? null : (
        <>
          {/* Grafico categorias */}
          {data.porCategoria.length > 0 && (
            <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px', color: '#F7FAFC', fontSize: '0.95rem', fontWeight: 600 }}>Gastos por Categoria</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.porCategoria} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
                  <XAxis dataKey="nombre" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatMonto(v)} contentStyle={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '8px', color: '#F7FAFC' }} />
                  <Bar dataKey="total" fill="#F97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tablas lado a lado */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <TablaResumen titulo="Por Categoria" datos={data.porCategoria} />
            <TablaResumen titulo="Por Caja" datos={data.porCaja} color="#8B5CF6" />
          </div>
        </>
      )}
    </div>
  );
}

function TablaResumen({ titulo, datos, color = '#F97316' }) {
  const total = datos.reduce((s, d) => s + d.total, 0);
  return (
    <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #2D3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#F7FAFC', fontSize: '0.9rem', fontWeight: 600 }}>{titulo}</h3>
        <span style={{ color, fontWeight: 700, fontSize: '0.9rem' }}>{formatMonto(total)}</span>
      </div>
      {datos.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#94A3B8', fontSize: '0.85rem' }}>Sin datos</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2D3748' }}>
              <th style={thStyle}>Nombre</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Cantidad</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((d, i) => {
              const pct = total > 0 ? ((d.total / total) * 100).toFixed(0) : 0;
              return (
                <tr key={i} style={{ borderBottom: '1px solid #1E2333' }}>
                  <td style={{ padding: '9px 16px', color: '#F7FAFC' }}>
                    <div>{d.nombre}</div>
                    <div style={{ marginTop: '4px', height: '3px', background: '#2D3748', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px' }} />
                    </div>
                  </td>
                  <td style={{ padding: '9px 16px', color: '#94A3B8', textAlign: 'center' }}>{d.cantidad}</td>
                  <td style={{ padding: '9px 16px', color, fontWeight: 600, textAlign: 'right', whiteSpace: 'nowrap' }}>{formatMonto(d.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', color: '#94A3B8', fontSize: '0.78rem', marginBottom: '5px', fontWeight: 500 };
const thStyle    = { padding: '9px 16px', textAlign: 'left', color: '#64748B', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase' };
