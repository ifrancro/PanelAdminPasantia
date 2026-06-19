import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Store,
    Users,
    Package,
    TrendingUp,
    CheckCircle,
    Clock,
    UserCheck,
    CreditCard,
    AlertCircle
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getAllClubes } from "../services/ClubService";
import { getAllProductos } from "../services/ProductoService";
import { getAllUsuarios } from "../services/UsuarioService";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalClubes: 0,
        clubesActivos: 0,
        clubesPendientes: 0,
        clubesInactivos: 0,
        totalProductos: 0,
        productosSimples: 0,
        combos: 0,
        totalUsuarios: 0,
        usuariosSocio: 0,
        usuariosAnfitrion: 0,
        loading: true,
    });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [clubesRes, productosRes, usuariosRes] = await Promise.all([
                getAllClubes(),
                getAllProductos(),
                getAllUsuarios(),
            ]);

            const clubes = clubesRes.data || [];
            const productos = productosRes.data || [];
            const usuarios = usuariosRes.data || [];

            setStats({
                totalClubes: clubes.length,
                clubesActivos: clubes.filter(c => c.estado === "ACTIVO").length,
                clubesPendientes: clubes.filter(c => c.estado === "PENDIENTE").length,
                clubesInactivos: clubes.filter(c => c.estado === "INACTIVO").length,
                
                totalProductos: productos.length,
                productosSimples: productos.filter(p => !p.esCombo).length,
                combos: productos.filter(p => p.esCombo).length,
                
                totalUsuarios: usuarios.length,
                usuariosSocio: usuarios.filter(u => u.rolNombre?.toUpperCase() === "SOCIO").length,
                usuariosAnfitrion: usuarios.filter(u => u.rolNombre?.toUpperCase() === "ANFITRION").length,
                
                loading: false,
            });
        } catch (error) {
            console.error("Error al cargar datos del dashboard:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    if (stats.loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#f8fafc]">
                <div className="animate-spin h-10 w-10 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    // Datos para gráficos
    const clubesData = [
        { name: 'Activos', valor: stats.clubesActivos, fill: '#10b981' }, // Verde esmeralda
        { name: 'Pendientes', valor: stats.clubesPendientes, fill: '#f59e0b' }, // Ámbar
        { name: 'Inactivos', valor: stats.clubesInactivos, fill: '#ef4444' }, // Rojo
    ];

    const productosData = [
        { name: 'Productos Simples', valor: stats.productosSimples, fill: '#3b82f6' }, // Azul
        { name: 'Combos', valor: stats.combos, fill: '#8b5cf6' }, // Púrpura
    ];

    const usuariosData = [
        { name: 'Socios', Usuarios: stats.usuariosSocio },
        { name: 'Anfitriones', Usuarios: stats.usuariosAnfitrion },
        { name: 'Otros', Usuarios: stats.totalUsuarios - stats.usuariosSocio - stats.usuariosAnfitrion },
    ];

    return (
        <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen">
            {/* Header del Dashboard */}
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-herbalife-green" />
                        Dashboard Analítico
                    </h1>
                    <p className="text-sm text-gray-500 mt-1 font-semibold uppercase tracking-wider">Métricas Actuales del Sistema Herbalife</p>
                </div>
            </div>

            {/* Fila 1: KPIs Rápidos Estilo Tarjeta Alta */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Usuarios */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Usuarios</p>
                        <p className="text-4xl font-extrabold text-gray-800">{stats.totalUsuarios}</p>
                    </div>
                </div>

                {/* Total Clubes */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                            <Store className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Clubes Activos</p>
                        <p className="text-4xl font-extrabold text-gray-800">{stats.clubesActivos}</p>
                    </div>
                </div>

                {/* Pendientes */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Solicitudes</p>
                        <p className="text-4xl font-extrabold text-gray-800">{stats.clubesPendientes}</p>
                    </div>
                </div>

                {/* Productos */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Catálogo</p>
                        <p className="text-4xl font-extrabold text-gray-800">{stats.totalProductos}</p>
                    </div>
                </div>
            </div>

            {/* Fila 2: Gráficos Principales */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Gráfico de Barras: Usuarios */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 p-8 xl:col-span-2">
                    <div className="mb-8">
                        <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Distribución de Usuarios</h2>
                        <p className="text-xs text-gray-400 font-medium mt-1">Comparativa de roles registrados en el sistema</p>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={usuariosData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip 
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                {/* Color rosa fuerte estilo Aurora Bank */}
                                <Bar dataKey="Usuarios" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Accesos Rápidos (Panel Oscuro Lateral como en Aurora Bank) */}
                <div className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white flex flex-col relative overflow-hidden">
                    {/* Efecto decorativo de fondo */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-herbalife-green rounded-full opacity-10 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl"></div>

                    <div className="relative z-10 flex-1">
                        <h2 className="text-xs font-black text-slate-300 uppercase tracking-widest mb-2">Panel Rápido</h2>
                        <h3 className="text-2xl font-bold mb-8">Accesos Directos</h3>
                        
                        <div className="space-y-3">
                            <button onClick={() => navigate("/clubes")} className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                        <Store className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-sm text-slate-200">Administrar Clubes</span>
                                </div>
                                <span className="text-slate-500 group-hover:text-emerald-400 transition-colors">→</span>
                            </button>
                            <button onClick={() => navigate("/usuarios")} className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-sm text-slate-200">Ver Usuarios</span>
                                </div>
                                <span className="text-slate-500 group-hover:text-blue-400 transition-colors">→</span>
                            </button>
                            <button onClick={() => navigate("/productos")} className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <span className="font-semibold text-sm text-slate-200">Catálogo de Productos</span>
                                </div>
                                <span className="text-slate-500 group-hover:text-purple-400 transition-colors">→</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fila 3: Gráficos Circulares */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico Circular: Estado de Clubes */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 p-8 flex flex-col">
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-1">Estado de Clubes</h2>
                    <p className="text-xs text-gray-400 font-medium mb-8">Resumen de operatividad de clubes registrados</p>
                    
                    <div className="h-[280px] relative flex-1">
                        {stats.totalClubes > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={clubesData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="valor"
                                        stroke="none"
                                    >
                                        {clubesData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '500' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sin datos de clubes</div>
                        )}
                        {/* Texto centrado en el donut */}
                        {stats.totalClubes > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-3xl font-black text-gray-800">{stats.totalClubes}</span>
                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Total</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfico Circular: Productos */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100/50 p-8 flex flex-col">
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-1">Inventario de Catálogo</h2>
                    <p className="text-xs text-gray-400 font-medium mb-8">Clasificación de elementos disponibles</p>
                    
                    <div className="h-[280px] relative flex-1">
                        {stats.totalProductos > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={productosData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="valor"
                                        stroke="none"
                                    >
                                        {productosData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '500' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">Sin datos de productos</div>
                        )}
                         {/* Texto centrado en el donut */}
                         {stats.totalProductos > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                <span className="text-3xl font-black text-gray-800">{stats.totalProductos}</span>
                                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-widest">Total</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
