import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * 🔐 ProtectedRoute
 * Protege rutas que requieren autenticación
 */
export default function ProtectedRoute({ children }) {
    const { user, loading, token } = useAuth();

    // Mostrar loading mientras verifica sesión
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-herbalife-green">
                <div className="animate-spin h-12 w-12 border-4 border-white border-t-transparent rounded-full mb-4"></div>
                <p className="text-white text-lg font-medium">Verificando sesión...</p>
            </div>
        );
    }

    // Si no hay token ni usuario, redirige al login
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, renderiza el contenido
    return children;
}
