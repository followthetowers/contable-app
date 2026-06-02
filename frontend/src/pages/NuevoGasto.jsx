import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCrearGasto, apiGetCategorias } from '../services/api';
import { fechaHoy, METODOS_PAGO, TIPOS_PERIODO } from '../utils/formatear';

const FORM_INICIAL = {
  fecha:        fechaHoy(),
  monto:        '',
  descripcion:  '',
  categoria_id: '',
  caja_id:      '',
  metodo_pago:  'Efectivo',
  tipo_periodo: 'diario',
};

export default function NuevoGasto() {
  const [form,       setForm]       = useState(FORM_INICIAL);
  const [categorias, setCategorias] = useState([]);
  const [cajas,      setCajas]      = useState([]);
  const [cargando,   setCargando]   = useState(false);
  const [exito,      setExito]      = useState(false);
  const [error,      setError]      = useState('');
  const montoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiGetCategorias().then(r => {
      setCategorias(r.data.filter(c => c.tipo === 'categoria'));
      setCajas(r.data.filter(c => c.tipo === 'caja'));
    }).catch(() => navigate('/login'));
    // Auto-foco en monto
    setTimeout(() => montoRef.current?.focus(), 100);
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fecha || !form.monto) { setError('Fecha y monto son obligatorios.'); return; }
    setCargando(true);
    setError('');
    try {
      await apiCrearGasto(form);
      setExito(true);
      setForm({ ...FORM_INICIAL, fecha: fechaHoy() });
      setTimeout(() => { setExito(false); montoRef.current?.focus(); }, 2000);
    } catch {
      setError('Error al guardar el gasto. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '640px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.5rem', fontWeight: 700 }}>Nuevo Gasto</h1>
        <p style={{ margin: '4px 0 0', color: '#94A3B8', fontSize: '0.88rem' }}>Cargá un gasto en menos de 10 segundos</p>
      </div>

      <div style={{ background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '16px', padding: '28px' }}>
        {exito && (
          <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#6EE7B7', fontSize: '0.9rem', fontWeight: 500 }}>
            ✓ Gasto guardado correctamente
          </div>
        )}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', color: '#FCA5A5', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Fila 1: Fecha + Monto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>Monto ($) *</label>
              <input
                ref={montoRef}
                type="number"
                name="monto"
                value={form.monto}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
              />
            </div>
          </div>

          {/* Descripcion */}
          <div>
            <label style={labelStyle}>Descripcion</label>
            <input type="text" name="descripcion" value={form.descripcion} onChange={handleChange} placeholder="Ej: Alquiler local, nafta, etc." />
          </div>

          {/* Categoria + Caja */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select name="categoria_id" value={form.categoria_id} onChange={handleChange}>
                <option value="">Sin categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Caja / Area</label>
              <select name="caja_id" value={form.caja_id} onChange={handleChange}>
                <option value="">Sin caja</option>
                {cajas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Metodo pago + Tipo periodo */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={labelStyle}>Metodo de pago</label>
              <select name="metodo_pago" value={form.metodo_pago} onChange={handleChange}>
                {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo de gasto</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                {TIPOS_PERIODO.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, tipo_periodo: t.value }))}
                    style={{
                      flex: 1, padding: '10px 4px', borderRadius: '8px', border: '1px solid',
                      borderColor: form.tipo_periodo === t.value ? '#F97316' : '#2D3748',
                      background:  form.tipo_periodo === t.value ? 'rgba(249,115,22,0.1)' : 'transparent',
                      color:       form.tipo_periodo === t.value ? '#F97316' : '#94A3B8',
                      cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.15s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Boton guardar */}
          <button
            type="submit"
            disabled={cargando}
            style={{
              marginTop: '8px', padding: '16px', borderRadius: '10px',
              background: cargando ? '#4A5568' : '#F97316',
              border: 'none', color: '#fff', fontWeight: 700, fontSize: '1.05rem',
              cursor: cargando ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
            }}
          >
            {cargando ? 'Guardando...' : '💾 Guardar gasto'}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block', color: '#94A3B8', fontSize: '0.8rem',
  marginBottom: '6px', fontWeight: 500,
};
