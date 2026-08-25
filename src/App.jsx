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
import React, { Suspense, lazy } from "react";
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
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ClubPage = lazy(() => import("./pages/ClubPage"));
const ProductoPage = lazy(() => import("./pages/ProductoPage"));
const NivelSocioPage = lazy(() => import("./pages/NivelSocioPage"));

// Páginas protegidas - Fase 2
const UsuarioPage = lazy(() => import("./pages/UsuarioPage"));
const EventoPage = lazy(() => import("./pages/EventoPage"));

// Páginas protegidas - Fase 3
const SoportePage = lazy(() => import("./pages/SoportePage"));
const AsistenciaPage = lazy(() => import("./pages/AsistenciaPage"));
const MembresiaPage = lazy(() => import("./pages/MembresiaPage"));
const ReportsPage = lazy(() => import("./pages/Reports/ReportsPage"));

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
                <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-herbalife-green"></div></div>}>
                  <MainLayout />
                </Suspense>
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


