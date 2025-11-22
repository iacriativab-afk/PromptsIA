
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './pages/Dashboard';
import TermsOfService from './components/TermsOfService';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './AuthContext';

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rota pública: Landing Page (redireciona para dashboard se já logado) */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
      />

      {/* Rota pública: Termos de Uso */}
      <Route path="/termos" element={<TermsOfService />} />

      {/* Rotas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      {/* Fallback para 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
