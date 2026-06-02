import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGetGastos, apiEliminarGasto, apiGetCategorias } from '../services/api';
import { formatMonto, formatFecha, METODOS_PAGO } from '../utils/formatear';
import ModalEditar from '../components/ModalEditar';

export default function Movimientos() {
  const [gastos,     setGastos]     = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cajas,      setCajas]      = useState([]);
  const [cargando,   setCargando]   = useState(true);
  const [gastoEdit,  setGastoEdit]  = useState(null);

  const [filtros, setFiltros] = useState({
    fecha_desde: '', fecha_hasta: '',
    categoria_id: '', caja_id: '',
    metodo_pago: '', busqueda: '',
  });

  const navigate = useNavigate();

  const cargarCategorias = async () => {
    const res = await apiGetCategorias();
    setCategorias(res.data.filter(c => c.tipo === 'categoria'));
    setCajas(res.data.filter(c => c.tipo === 'caja'));
  };

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
  }, [filtros]);

  useEffect(() => { cargarCategorias(); }, []);
  useEffect(() => { cargarGastos(); }, [cargarGastos]);

  const handleFiltro = (e) => {
    setFiltros(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const limpiarFiltros = () => {
    setFiltros({ fecha_desde: '', fecha_hasta: '', categoria_id: '', caja_id: '', metodo_pago: '', busqueda: '' });
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Eliminar este gasto?')) return;
    await apiEliminarGasto(id);
    cargarGastos();
  };

  const totalFiltrado = gastos.reduce((s, g) => s + g.monto, 0);

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.5rem', fontWeight: 700 }}>Movimientos</h1>
        <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.88rem' }}>{gastos.length} registros encontrados · Total: <span style={{ color: '#F97316', fontWeight: 600 }}>{formatMonto(totalFiltrado)}</span></p>
      </div>

      {/* Filtros */}
      <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <div>
            <label style={labelStyle}>Desde</label>
            <input type="date" name="fecha_desde" value={filtros.fecha_desde} onChange={handleFiltro} />
          </div>
          <div>
            <label style={labelStyle}>Hasta</label>
            <input type="date" name="fecha_hasta" value={filtros.fecha_hasta} onChange={handleFiltro} />
          </div>
          <div>
            <label style={labelStyle}>Categoria</label>
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
            <label style={labelStyle}>Metodo de pago</label>
            <select name="metodo_pago" value={filtros.metodo_pago} onChange={handleFiltro}>
              <option value="">Todos</option>
              {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Buscar descripcion</label>
            <input type="text" name="busqueda" value={filtros.busqueda} onChange={handleFiltro} placeholder="Buscar..." />
          </div>
        </div>
        <button onClick={limpiarFiltros} style={{ background: 'transparent', border: '1px solid #2D3748', color: '#94A3B8', padding: '7px 16px', borderRadius: '7px', cursor: 'pointer', fontSize: '0.82rem' }}>
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '12px', overflow: 'hidden' }}>
        {cargando ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>Cargando...</div>
        ) : gastos.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>No se encontraron gastos con los filtros aplicados.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2D3748', background: '#141720' }}>
                  {['Fecha', 'Descripcion', 'Categoria', 'Caja', 'Metodo', 'Periodo', 'Monto', 'Acciones'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', color: '#64748B', fontWeight: 500, fontSize: '0.78rem', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gastos.map((g, i) => (
                  <tr key={g.id} style={{ borderBottom: '1px solid #1E2333', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={tdStyle}>{formatFecha(g.fecha)}</td>
                    <td style={{ ...tdStyle, color: '#F7FAFC', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.descripcion || '-'}</td>
                    <td style={tdStyle}><Badge texto={g.categoria_nombre} color="#3B82F6" /></td>
                    <td style={tdStyle}><Badge texto={g.caja_nombre} color="#8B5CF6" /></td>
                    <td style={tdStyle}>{g.metodo_pago || '-'}</td>
                    <td style={tdStyle}><Badge texto={g.tipo_periodo} color="#10B981" /></td>
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
        )}
      </div>

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
  };
}
