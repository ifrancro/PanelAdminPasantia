/**
 * 🚀 App.jsx
 * Router principal del panel administrativo Herbalife
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
import RoleProtectedRoute from "./routes/RoleProtectedRoute";
import { routeConfig } from "./routes/routeConfig";

import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";

import "./index.css";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {routeConfig.map((route) => {
              const element = (
                <RoleProtectedRoute allowedRoles={route.allowedRoles}>
                  <route.Component />
                </RoleProtectedRoute>
              );

              if (route.index) {
                return <Route key={route.id} index element={element} />;
              }

              return (
                <Route key={route.id} path={route.path} element={element} />
              );
            })}
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
