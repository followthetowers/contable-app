import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiGetGastos, apiEliminarGasto, apiGetCategorias } from '../services/api';
import { formatMonto, formatFecha, METODOS_PAGO } from '../utils/formatear';
import ModalEditar from '../components/ModalEditar';

function getPeriodo(tipo) {
  const hoy = new Date();
  const fmt = d => d.toISOString().split('T')[0];
  if (tipo === 'hoy') return { desde: fmt(hoy), hasta: fmt(hoy) };
  if (tipo === 'semana') {
    const lunes = new Date(hoy); lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
    return { desde: fmt(lunes), hasta: fmt(hoy) };
  }
  if (tipo === 'mes') {
    return { desde: fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta: fmt(hoy) };
  }
  if (tipo === 'mes_anterior') {
    const ini = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    return { desde: fmt(ini), hasta: fmt(fin) };
  }
  return { desde: '', hasta: '' };
}

const PERIODOS_ADMIN = [
  { key: 'hoy',          label: 'Hoy' },
  { key: 'semana',       label: 'Esta semana' },
  { key: 'mes',          label: 'Este mes' },
];

const PERIODOS_TODOS = [
  { key: 'todo',         label: 'Todo' },
  { key: 'hoy',         label: 'Hoy' },
  { key: 'semana',      label: 'Esta semana' },
  { key: 'mes',         label: 'Este mes' },
  { key: 'mes_anterior',label: 'Mes anterior' },
  { key: 'custom',      label: 'Personalizado' },
];

export default function Movimientos() {
  const { rol } = useAuth();
  const PERIODOS = rol === 'admin' ? PERIODOS_TODOS : PERIODOS_ADMIN;
  const [gastos,     setGastos]     = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cajas,      setCajas]      = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [gastoEdit,  setGastoEdit]  = useState(null);
  const [periodo,    setPeriodo]    = useState('mes');
  const [filtros, setFiltros] = useState({
    fecha_desde: getPeriodo('mes').desde,
    fecha_hasta: getPeriodo('mes').hasta,
    categoria_id: '', caja_id: '', metodo_pago: '', busqueda: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    apiGetCategorias().then(res => {
      setCategorias(res.data.filter(c => c.tipo === 'categoria'));
      setCajas(res.data.filter(c => c.tipo === 'caja'));
    });
  }, []);

  const cargarGastos = useCallback(async () => {
    setCargando(true);
    try {
      const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v !== ''));
      const res = await apiGetGastos(params);
      setGastos(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setCargando(false);
    }
  }, [filtros, navigate]);

  useEffect(() => { cargarGastos(); }, [cargarGastos]);

  const seleccionarPeriodo = (key) => {
    setPeriodo(key);
    if (key !== 'custom') {
      const { desde, hasta } = getPeriodo(key);
      setFiltros(prev => ({ ...prev, fecha_desde: desde, fecha_hasta: hasta }));
    }
  };

  const handleFiltro = (e) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const limpiarFiltros = () => {
    setPeriodo('todo');
    setFiltros({ fecha_desde: '', fecha_hasta: '', categoria_id: '', caja_id: '', metodo_pago: '', busqueda: '' });
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    await apiEliminarGasto(id);
    cargarGastos();
  };

  const totalFiltrado = gastos.reduce((s, g) => s + g.monto, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.5rem', fontWeight: 700 }}>Movimientos</h1>
        <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.88rem' }}>
          {gastos.length} registros · Total: <span style={{ color: '#F97316', fontWeight: 600 }}>{formatMonto(totalFiltrado)}</span>
        </p>
      </div>

      {/* Selector de período */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {PERIODOS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => seleccionarPeriodo(key)}
            style={{
              padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.15s',
              background: periodo === key ? '#F97316' : '#1A1D27',
              color: periodo === key ? '#fff' : '#94A3B8',
              border: periodo === key ? 'none' : '1px solid #2D3748',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtros adicionales */}
      <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          {periodo === 'custom' && <>
            <div>
              <label style={labelStyle}>Desde</label>
              <input type="date" name="fecha_desde" value={filtros.fecha_desde} onChange={handleFiltro} />
            </div>
            <div>
              <label style={labelStyle}>Hasta</label>
              <input type="date" name="fecha_hasta" value={filtros.fecha_hasta} onChange={handleFiltro} />
            </div>
          </>}
          <div>
            <label style={labelStyle}>Categoría</label>
            <select name="categoria_id" value={filtros.categoria_id} onChange={handleFiltro}>
              <option value="">Todas</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Caja</label>
            <select name="caja_id" value={filtros.caja_id} onChange={handleFiltro}>
              <option value="">Todas</option>
              {cajas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Método de pago</label>
            <select name="metodo_pago" value={filtros.metodo_pago} onChange={handleFiltro}>
              <option value="">Todos</option>
              {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Buscar</label>
            <input type="text" name="busqueda" value={filtros.busqueda} onChange={handleFiltro} placeholder="Descripción..." />
          </div>
        </div>
        <button onClick={limpiarFiltros} style={{ marginTop: '12px', background: 'transparent', border: '1px solid #2D3748', color: '#94A3B8', padding: '6px 14px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Limpiar filtros
        </button>
      </div>

      {/* Contenido */}
      {cargando ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Cargando...</div>
      ) : gastos.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8', background: '#1A1D27', borderRadius: '12px', border: '1px solid #2D3748' }}>
          No hay gastos para el período seleccionado.
        </div>
      ) : (
        <>
          {/* Tabla desktop */}
          <div className="tabla-desktop" style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #2D3748', background: '#141720' }}>
                    {['Fecha', 'Descripción', 'Categoría', 'Caja', 'Método', 'Monto', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((g, i) => (
                    <tr key={g.id} style={{ borderBottom: '1px solid #1E2333', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={tdStyle}>{formatFecha(g.fecha)}</td>
                      <td style={{ ...tdStyle, color: '#F7FAFC', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.descripcion || '-'}</td>
                      <td style={tdStyle}><Badge texto={g.categoria_nombre} color="#3B82F6" /></td>
                      <td style={tdStyle}><Badge texto={g.caja_nombre} color="#8B5CF6" /></td>
                      <td style={tdStyle}>{g.metodo_pago || '-'}</td>
                      <td style={{ ...tdStyle, color: '#F97316', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatMonto(g.monto)}</td>
                      <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                        <button onClick={() => setGastoEdit(g)} style={btnStyle('#3B82F6')}>Editar</button>
                        <button onClick={() => eliminar(g.id)} style={{ ...btnStyle('#EF4444'), marginLeft: '6px' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjetas mobile */}
          <div className="tarjetas-mobile" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {gastos.map(g => (
              <div key={g.id} style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ color: '#F7FAFC', fontWeight: 600, fontSize: '0.95rem' }}>{g.descripcion || 'Sin descripción'}</div>
                    <div style={{ color: '#64748B', fontSize: '0.78rem', marginTop: '2px' }}>{formatFecha(g.fecha)}</div>
                  </div>
                  <div style={{ color: '#F97316', fontWeight: 700, fontSize: '1.05rem' }}>{formatMonto(g.monto)}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                  <Badge texto={g.categoria_nombre} color="#3B82F6" />
                  <Badge texto={g.caja_nombre} color="#8B5CF6" />
                  {g.metodo_pago && <Badge texto={g.metodo_pago} color="#64748B" />}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setGastoEdit(g)} style={{ ...btnStyle('#3B82F6'), flex: 1 }}>Editar</button>
                  <button onClick={() => eliminar(g.id)} style={{ ...btnStyle('#EF4444'), flex: 1 }}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {gastoEdit && (
        <ModalEditar
          gasto={gastoEdit}
          onCerrar={() => setGastoEdit(null)}
          onGuardado={() => { setGastoEdit(null); cargarGastos(); }}
        />
      )}
    </div>
  );
}

const labelStyle = { display: 'block', color: '#94A3B8', fontSize: '0.78rem', marginBottom: '5px', fontWeight: 500 };
const tdStyle    = { padding: '10px 14px', color: '#94A3B8', verticalAlign: 'middle' };

function Badge({ texto, color }) {
  if (!texto) return <span style={{ color: '#4A5568' }}>-</span>;
  return <span style={{ background: `${color}20`, color, padding: '2px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 500 }}>{texto}</span>;
}

function btnStyle(color) {
  return {
    padding: '5px 12px', borderRadius: '6px', border: `1px solid ${color}40`,
    background: `${color}15`, color, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
    textAlign: 'center',
  };
}
