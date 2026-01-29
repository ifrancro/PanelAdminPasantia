import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

/**
 * 🏗️ MainLayout
 * Layout principal con Sidebar y Header
 */
export default function MainLayout() {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                Panel Administrativo
                            </h1>
                            <p className="text-sm text-gray-500">
                                Herbalife Clubes
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-700">
                                    {user?.nombre} {user?.apellido}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.rol?.nombre || "Administrador"}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-herbalife-green to-herbalife-dark rounded-full flex items-center justify-center text-white font-semibold">
                                {user?.nombre?.charAt(0) || "A"}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Área de contenido */}
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
