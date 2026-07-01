import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,   setToken]   = useState(() => localStorage.getItem('token') || null);
  const [usuario, setUsuario] = useState(() => localStorage.getItem('usuario') || null);
  const [rol,     setRol]     = useState(() => localStorage.getItem('rol') || 'usuario');

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = (tok, user, rolUsuario = 'usuario') => {
    localStorage.setItem('token',   tok);
    localStorage.setItem('usuario', user);
    localStorage.setItem('rol',     rolUsuario);
    axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    setToken(tok);
    setUsuario(user);
    setRol(rolUsuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('rol');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUsuario(null);
    setRol('usuario');
  };

  return (
    <AuthContext.Provider value={{ token, usuario, rol, login, logout, estaLogueado: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
