import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

// Auth
export const apiLogin = (usuario, password) =>
  axios.post(`${BASE}/auth/login`, { usuario, password });

// Gastos
export const apiGetGastos = (filtros = {}) =>
  axios.get(`${BASE}/gastos`, { params: filtros });

export const apiCrearGasto = (data) =>
  axios.post(`${BASE}/gastos`, data);

export const apiActualizarGasto = (id, data) =>
  axios.put(`${BASE}/gastos/${id}`, data);

export const apiEliminarGasto = (id) =>
  axios.delete(`${BASE}/gastos/${id}`);

// Categorias
export const apiGetCategorias = () =>
  axios.get(`${BASE}/categorias`);

// Reportes
export const apiGetDashboard = () =>
  axios.get(`${BASE}/reportes/dashboard`);

export const apiGetResumen = (params = {}) =>
  axios.get(`${BASE}/reportes/resumen`, { params });

export const apiGetAlmanaque = (año) =>
  axios.get(`${BASE}/reportes/almanaque`, { params: { año } });

export const apiGetGastosMes = (año, mes) =>
  axios.get(`${BASE}/reportes/mes/${año}/${mes}`);

export const apiExportarCSV = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const token = localStorage.getItem('token');
  window.open(`${BASE}/reportes/exportar?${query}&token=${token}`, '_blank');
};
