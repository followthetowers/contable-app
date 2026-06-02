import { formatMonto } from '../utils/formatear';

export default function TarjetaResumen({ titulo, monto, icono, color = '#F97316', subtitulo }) {
  return (
    <div style={{
      background: '#1A1D27',
      border: '1px solid #2D3748',
      borderRadius: '12px',
      padding: '20px 24px',
      flex: 1,
      minWidth: '180px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {titulo}
        </span>
        <span style={{ fontSize: '1.4rem' }}>{icono}</span>
      </div>
      <div style={{ color: color, fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px' }}>
        {formatMonto(monto)}
      </div>
      {subtitulo && (
        <div style={{ color: '#64748B', fontSize: '0.78rem' }}>{subtitulo}</div>
      )}
    </div>
  );
}
