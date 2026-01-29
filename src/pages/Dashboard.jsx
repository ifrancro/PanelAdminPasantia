/**
 * 🏠 Dashboard.jsx
 * Panel principal del administrador con estadísticas en tiempo real
 * Muestra KPIs y accesos rápidos a funciones críticas
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Store,
    Users,
    CalendarCheck,
    Building2,
    Clock,
    CheckCircle,
    Package,
    TrendingUp
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllClubes } from "../services/ClubService";
import { getAllHubs } from "../services/HubService";
import { getAllProductos } from "../services/ProductoService";

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estados para datos del dashboard
    const [stats, setStats] = useState({
        totalClubes: 0,
        clubesPendientes: 0,
        clubesActivos: 0,
        totalHubs: 0,
        totalProductos: 0,
        loading: true,
    });

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Cargar datos en paralelo
            const [clubesRes, hubsRes, productosRes] = await Promise.all([
                getAllClubes(),
                getAllHubs(),
                getAllProductos(),
            ]);

            const clubes = clubesRes.data;

            setStats({
                totalClubes: clubes.length,
                clubesPendientes: clubes.filter(c => c.estado === "PENDIENTE").length,
                clubesActivos: clubes.filter(c => c.estado === "ACTIVO").length,
                totalHubs: hubsRes.data.length,
                totalProductos: productosRes.data.length,
                loading: false,
            });
        } catch (error) {
            console.error("Error al cargar datos del dashboard:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (stats.loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header de bienvenida */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Bienvenido, {user?.nombre || "Admin"} 👋
                </h1>
                <p className="text-gray-500 mt-1">
                    Panel de control - Herbalife Clubes
                </p>
            </div>

            {/* === KPIs PRINCIPALES === */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Clubes */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-herbalife-green">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Clubes</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalClubes}</p>
                        </div>
                        <div className="p-3 bg-herbalife-green/10 rounded-lg">
                            <Store className="w-8 h-8 text-herbalife-green" />
                        </div>
                    </div>
                </div>

                {/* Clubes Pendientes */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pendientes</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.clubesPendientes}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 rounded-lg">
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </div>
                    {stats.clubesPendientes > 0 && (
                        <button
                            onClick={() => navigate("/clubes")}
                            className="mt-3 text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                            Revisar solicitudes →
                        </button>
                    )}
                </div>

                {/* Clubes Activos */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Activos</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.clubesActivos}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Total Hubs */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Hubs</p>
                            <p className="text-3xl font-bold text-gray-800 mt-1">{stats.totalHubs}</p>
                        </div>
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Building2 className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* === STATS ADICIONALES === */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productos en catálogo */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Catálogo</h3>
                    </div>
                    <div className="flex items-end justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Productos disponibles</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalProductos}</p>
                        </div>
                        <button
                            onClick={() => navigate("/productos")}
                            className="text-sm text-herbalife-green hover:text-herbalife-dark font-medium"
                        >
                            Ver catálogo →
                        </button>
                    </div>
                </div>

                {/* Actividad */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Actividad</h3>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-800">{stats.clubesPendientes}</span> solicitudes por revisar
                        </p>
                        <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-800">{stats.clubesActivos}</span> clubes operando
                        </p>
                    </div>
                </div>
            </div>

            {/* === ACCESOS RÁPIDOS === */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Accesos Rápidos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate("/clubes")}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-herbalife-green hover:bg-herbalife-green/5 transition-all"
                    >
                        <Store className="w-6 h-6 text-herbalife-green mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Clubes</p>
                    </button>
                    <button
                        onClick={() => navigate("/hubs")}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                        <Building2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Hubs</p>
                    </button>
                    <button
                        onClick={() => navigate("/productos")}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                    >
                        <Package className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Productos</p>
                    </button>
                    <button
                        onClick={() => navigate("/usuarios")}
                        className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all"
                    >
                        <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Usuarios</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
