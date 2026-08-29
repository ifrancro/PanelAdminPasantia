/**
 * 🚀 App.jsx
 * Router principal del panel administrativo Herbalife
 * 
 * Estructura de rutas según el plan MVP:
 * - Dashboard: Página principal con KPIs
 * - Estructura: Hubs y Clubes
 * - Usuarios: Usuarios y Membresías
 * - Catálogo: Productos, Niveles, Logros
 * - Operaciones: Asistencias
 * - Comunicación: Eventos
 * - Soporte: Tickets
 */
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Páginas públicas
import LoginPage from "./pages/LoginPage";

// Páginas protegidas - Fase 1
import Dashboard from "./pages/Dashboard";         // ✅ Con datos reales
import ClubPage from "./pages/ClubPage";           // ✅ Fase 1
// HubPage removido - gestión eliminada
import ProductoPage from "./pages/ProductoPage";   // ✅ Fase 1
import NivelSocioPage from "./pages/NivelSocioPage"; // ✅ Fase 1

// Páginas protegidas - Fase 2
import UsuarioPage from "./pages/UsuarioPage";     // ✅ Fase 2
import EventoPage from "./pages/EventoPage";       // ✅ Fase 2
// NotificacionPage removido - funcionalidad eliminada

// Páginas protegidas - Fase 3
import SoportePage from "./pages/SoportePage";     // ✅ Fase 3
import AsistenciaPage from "./pages/AsistenciaPage"; // ✅ Fase 3
import MembresiaPage from "./pages/MembresiaPage"; // ✅ Fase 3
import ReportsPage from "./pages/Reports/ReportsPage"; // ✅ Reportes

import "./index.css";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* === RUTA PÚBLICA === */}
          <Route path="/login" element={<LoginPage />} />

          {/* === RUTAS PROTEGIDAS === */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* === ESTRUCTURA === */}
            {/* Hub route removida - gestión eliminada */}
            <Route path="clubes/*" element={<ClubPage />} />

            {/* === USUARIOS === */}
            <Route path="usuarios/*" element={<UsuarioPage />} />
            <Route path="membresias/*" element={<MembresiaPage />} />

            {/* === CATÁLOGO === */}
            <Route path="productos/*" element={<ProductoPage />} />
            <Route path="niveles-socio/*" element={<NivelSocioPage />} />

            {/* === OPERACIONES === */}
            <Route path="asistencias/*" element={<AsistenciaPage />} />

            {/* === COMUNICACIÓN === */}
            <Route path="eventos/*" element={<EventoPage />} />
            {/* Notificaciones route removida - funcionalidad eliminada */}

            {/* === SOPORTE === */}
            <Route path="soporte/*" element={<SoportePage />} />

            {/* === REPORTES === */}
            <Route path="reportes" element={<ReportsPage />} />
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

/**
 * Componente temporal para rutas pendientes de implementación
 */
function PlaceholderPage({ title }) {
  return (
    <div className="bg-white rounded-xl p-8 shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">{title}</h1>
      <p className="text-gray-500">
        Esta sección se implementará próximamente.
      </p>
    </div>
  );
}
