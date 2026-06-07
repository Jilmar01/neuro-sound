import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Componente que protege las rutas privadas.
 * Si el usuario no tiene un token (no ha iniciado sesión),
 * lo redirige automáticamente a la pantalla de onboarding/login.
 */
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  
  // Opcional: También podríamos validar si el token expiró, 
  // pero por ahora con que exista es suficiente para permitir acceso al frontend
  // (las peticiones protegidas igual fallarán si es inválido).
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
