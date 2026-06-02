import { useState, useEffect } from 'react';
import { apiActualizarGasto, apiGetCategorias } from '../services/api';
import { METODOS_PAGO, TIPOS_PERIODO } from '../utils/formatear';

export default function ModalEditar({ gasto, onCerrar, onGuardado }) {
  const [form,       setForm]       = useState({ ...gasto });
  const [categorias, setCategorias] = useState([]);
  const [cajas,      setCajas]      = useState([]);
  const [cargando,   setCargando]   = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    apiGetCategorias().then(r => {
      setCategorias(r.data.filter(c => c.tipo === 'categoria'));
      setCajas(r.data.filter(c => c.tipo === 'caja'));
    });
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
      await apiActualizarGasto(gasto.id, form);
      onGuardado();
    } catch {
      setError('Error al guardar. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div style={{
        background: '#1A1D27', border: '1px solid #2D3748', borderRadius: '16px',
        padding: '32px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#F7FAFC', fontSize: '1.2rem' }}>Editar gasto</h2>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', borderRadius: '8px', padding: '10px', marginBottom: '16px', color: '#FCA5A5', fontSize: '0.85rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input type="date" name="fecha" value={form.fecha || ''} onChange={handleChange} required />
            </div>
            <div>
              <label style={labelStyle}>Monto ($)</label>
              <input type="number" name="monto" value={form.monto || ''} onChange={handleChange} step="0.01" min="0" required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Descripcion</label>
            <input type="text" name="descripcion" value={form.descripcion || ''} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Categoria</label>
              <select name="categoria_id" value={form.categoria_id || ''} onChange={handleChange}>
                <option value="">Sin categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Caja</label>
              <select name="caja_id" value={form.caja_id || ''} onChange={handleChange}>
                <option value="">Sin caja</option>
                {cajas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Metodo de pago</label>
              <select name="metodo_pago" value={form.metodo_pago || ''} onChange={handleChange}>
                {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo de periodo</label>
              <select name="tipo_periodo" value={form.tipo_periodo || 'diario'} onChange={handleChange}>
                {TIPOS_PERIODO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onCerrar} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: 'transparent', border: '1px solid #2D3748', color: '#94A3B8', cursor: 'pointer', fontSize: '0.9rem' }}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando} style={{ flex: 2, padding: '12px', borderRadius: '8px', background: '#F97316', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', opacity: cargando ? 0.7 : 1 }}>
              {cargando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  color: '#94A3B8',
  fontSize: '0.8rem',
  marginBottom: '6px',
  fontWeight: 500,
};
