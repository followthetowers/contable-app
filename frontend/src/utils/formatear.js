export const formatMonto = (valor) => {
  if (valor === null || valor === undefined) return '$0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
};

export const formatFecha = (fechaStr) => {
  if (!fechaStr) return '-';
  const [anio, mes, dia] = fechaStr.split('-');
  return `${dia}/${mes}/${anio}`;
};

export const fechaHoy = () => {
  return new Date().toISOString().split('T')[0];
};

export const METODOS_PAGO = [
  'Efectivo',
  'Transferencia',
  'Débito',
  'Crédito',
  'Mercado Pago',
  'Otro',
];

export const TIPOS_PERIODO = [
  { value: 'diario',   label: 'Diario'   },
  { value: 'semanal',  label: 'Semanal'  },
  { value: 'mensual',  label: 'Mensual'  },
];

export const COLORES_GRAFICO = [
  '#F97316', '#3B82F6', '#10B981', '#8B5CF6',
  '#F59E0B', '#EC4899', '#14B8A6', '#EF4444',
];
