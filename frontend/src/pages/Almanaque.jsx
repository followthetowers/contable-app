import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiGetAlmanaque, apiGetGastosMes } from '../services/api';
import { formatMonto, formatFecha } from '../utils/formatear';

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
               'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function Almanaque() {
  const { rol } = useAuth();
  const ahora = new Date();
  const añoActual = ahora.getFullYear();
  const mesActual = ahora.getMonth() + 1;

  const [año, setAño]                   = useState(añoActual);
  const [meses, setMeses]               = useState([]);
  const [mesSeleccionado, setMesSel]    = useState(null);
  const [detalle, setDetalle]           = useState(null);
  const [cargando, setCargando]         = useState(false);
  const [cargandoDet, setCargandoDet]   = useState(false);

  useEffect(() => {
    setCargando(true);
    setMesSel(null);
    setDetalle(null);
    apiGetAlmanaque(año)
      .then(r => setMeses(r.data.meses))
      .finally(() => setCargando(false));
  }, [año]);

  const seleccionarMes = async (mes) => {
    if (mesSeleccionado === mes) { setMesSel(null); setDetalle(null); return; }
    setMesSel(mes);
    setCargandoDet(true);
    try {
      const r = await apiGetGastosMes(año, mes);
      setDetalle(r.data);
    } finally {
      setCargandoDet(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.5rem', fontWeight: 700 }}>Almanaque</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <button onClick={() => setAño(a => a - 1)} style={btnNavStyle}>←</button>
          <span style={{ color: '#F97316', fontWeight: 700, fontSize: '1.1rem', minWidth: '50px', textAlign: 'center' }}>{año}</span>
          <button onClick={() => setAño(a => a + 1)} disabled={año >= añoActual} style={{ ...btnNavStyle, opacity: año >= añoActual ? 0.3 : 1, cursor: año >= añoActual ? 'default' : 'pointer' }}>→</button>
        </div>
      </div>

      {/* Grilla de meses */}
      {cargando ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>Cargando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {meses.map((m, i) => {
            const numMes = i + 1;
            const esFuturo = año > añoActual || (año === añoActual && numMes > mesActual);
            const esActual = año === añoActual && numMes === mesActual;
            const seleccionado = mesSeleccionado === numMes;

            return (
              <button
                key={i}
                onClick={() => !esFuturo && seleccionarMes(numMes)}
                disabled={esFuturo}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: seleccionado ? '2px solid #F97316' : esActual ? '1px solid #F9731660' : '1px solid #2D3748',
                  background: seleccionado ? 'rgba(249,115,22,0.12)' : esActual ? 'rgba(249,115,22,0.05)' : '#1A1D27',
                  color: esFuturo ? '#4A5568' : '#F7FAFC',
                  cursor: esFuturo ? 'default' : 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{MESES[i]}</span>
                  {esActual && <span style={{ fontSize: '0.65rem', color: '#F97316', fontWeight: 700, background: 'rgba(249,115,22,0.15)', padding: '2px 6px', borderRadius: '10px' }}>HOY</span>}
                </div>
                {esFuturo ? (
                  <div style={{ color: '#4A5568', fontSize: '0.82rem' }}>—</div>
                ) : (
                  <>
                    <div style={{ color: '#F97316', fontWeight: 700, fontSize: '1rem' }}>{formatMonto(m.total)}</div>
                    <div style={{ color: '#64748B', fontSize: '0.72rem', marginTop: '4px' }}>{m.cantidad} movimientos</div>
                  </>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Panel de detalle */}
      {mesSeleccionado && (
        <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '14px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.1rem', fontWeight: 700 }}>
              {MESES[mesSeleccionado - 1]} {año}
            </h2>
            {detalle && (
              <div style={{ color: '#F97316', fontWeight: 700, fontSize: '1.2rem' }}>
                {formatMonto(detalle.total)}
                <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 400, marginLeft: '8px' }}>{detalle.cantidad} movimientos</span>
              </div>
            )}
          </div>

          {cargandoDet ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>Cargando...</div>
          ) : detalle?.restringido ? (
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔒</div>
              <div style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Sin acceso al detalle de meses anteriores</div>
            </div>
          ) : detalle?.gastos?.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#94A3B8' }}>Sin movimientos en este mes.</div>
          ) : (
            <>
              {/* Tabla desktop */}
              <div className="tabla-desktop" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2D3748', background: '#141720' }}>
                      {['Fecha','Descripción','Categoría','Caja','Método','Monto'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#64748B', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detalle?.gastos?.map((g, i) => (
                      <tr key={g.id} style={{ borderBottom: '1px solid #1E2333', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                        <td style={tdStyle}>{formatFecha(g.fecha)}</td>
                        <td style={{ ...tdStyle, color: '#F7FAFC', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.descripcion || '-'}</td>
                        <td style={tdStyle}><Badge texto={g.categoria_nombre} color="#3B82F6" /></td>
                        <td style={tdStyle}><Badge texto={g.caja_nombre} color="#8B5CF6" /></td>
                        <td style={tdStyle}>{g.metodo_pago || '-'}</td>
                        <td style={{ ...tdStyle, color: '#F97316', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatMonto(g.monto)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tarjetas mobile */}
              <div className="tarjetas-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {detalle?.gastos?.map(g => (
                  <div key={g.id} style={{ background: '#141720', border: '1px solid #2D3748', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ color: '#F7FAFC', fontWeight: 600, fontSize: '0.9rem' }}>{g.descripcion || 'Sin descripción'}</div>
                        <div style={{ color: '#64748B', fontSize: '0.75rem', marginTop: '2px' }}>{formatFecha(g.fecha)}</div>
                      </div>
                      <div style={{ color: '#F97316', fontWeight: 700, fontSize: '1rem' }}>{formatMonto(g.monto)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <Badge texto={g.categoria_nombre} color="#3B82F6" />
                      <Badge texto={g.caja_nombre} color="#8B5CF6" />
                      {g.metodo_pago && <Badge texto={g.metodo_pago} color="#64748B" />}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const tdStyle = { padding: '10px 14px', color: '#94A3B8', verticalAlign: 'middle' };
const btnNavStyle = {
  background: '#1A1D27', border: '1px solid #2D3748', color: '#94A3B8',
  padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
};

function Badge({ texto, color }) {
  if (!texto) return <span style={{ color: '#4A5568' }}>-</span>;
  return <span style={{ background: `${color}20`, color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 500 }}>{texto}</span>;
}
