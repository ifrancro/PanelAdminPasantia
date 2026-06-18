import React from "react";
import { NavLink } from "react-router-dom";
import {
    Home,           // Dashboard
    Building2,      // Hubs
    Store,          // Clubes
    Users,          // Usuarios
    UserCheck,      // Membresías
    Package,        // Productos
    CalendarCheck,  // Asistencias
    Calendar,       // Eventos
    HeadphonesIcon, // Soporte
    Layers,         // Niveles Socio
    FileText,       // Reportes
    LogOut,         // Cerrar sesión
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * 📑 Sidebar
 * Navegación lateral del panel administrativo
 */
export default function Sidebar() {
    const { user, logout } = useAuth();
    
    const userRole = user?.rol?.nombre?.toUpperCase();

    /**
     * 📑 menuSections
     * Estructura de navegación del panel administrativo
     * Organizada según el plan MVP aprobado
     */
    const menuSections = [
        // === SECCIÓN PRINCIPAL ===
        // Dashboard con KPIs y accesos rápidos
        {
            title: "Principal",
            links: [
                { to: "/", label: "Dashboard", icon: Home },
            ],
        },

        // === GESTIÓN DE ESTRUCTURA ===
        // Clubes (puntos de venta)
        // Aquí el admin aprueba/rechaza solicitudes de clubes
        {
            title: "Estructura",
            links: [
                { to: "/clubes", label: "Clubes", icon: Store },
            ],
        },

        // === GESTIÓN DE USUARIOS ===
        // Visualización de usuarios y membresías
        {
            title: "Usuarios",
            links: [
                { to: "/usuarios", label: "Usuarios", icon: Users },
                { to: "/membresias", label: "Membresías", icon: UserCheck },
            ],
        },

        // === CATÁLOGO ===
        // Productos: catálogo global que el admin gestiona
        // Niveles y Logros: configuración de gamificación
        {
            title: "Catálogo",
            links: [
                { to: "/productos", label: "Productos", icon: Package },
                { to: "/niveles-socio", label: "Niveles Socio", icon: Layers },
            ],
        },

        // === OPERACIONES (Solo lectura) ===
        // Visualización de asistencias de todos los clubes
        {
            title: "Operaciones",
            links: [
                { to: "/asistencias", label: "Asistencias", icon: CalendarCheck },
            ],
        },

        // === COMUNICACIÓN ===
        // Eventos corporativos
        {
            title: "Comunicación",
            links: [
                { to: "/eventos", label: "Eventos", icon: Calendar },
            ],
        },

        // === SOPORTE ===
        // Gestión de tickets de soporte
        {
            title: "Soporte",
            links: [
                { to: "/soporte", label: "Tickets", icon: HeadphonesIcon },
            ],
        },

        // === REPORTES ===
        // Generación de reportes en PDF
        {
            title: "Reportes",
            links: [
                { to: "/reportes", label: "Reportes", icon: FileText },
            ],
        },
    ];

    // Filtrar secciones según el rol del usuario (ANFITRION solo ve dashboard, clubes, productos y asistencias)
    const filteredSections = menuSections.map(section => {
        const links = section.links.filter(link => {
            if (userRole === "ANFITRION") {
                const allowedPaths = ["/", "/clubes", "/productos", "/asistencias"];
                return allowedPaths.includes(link.to);
            }
            return true; // Admin ve todo
        }).map(link => {
            // Renombrar Clubes a "Mis Clubes" para anfitriones
            if (userRole === "ANFITRION" && link.to === "/clubes") {
                return { ...link, label: "Mis Clubes" };
            }
            return link;
        });

        return { ...section, links };
    }).filter(section => section.links.length > 0);

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-herbalife-light to-herbalife-green rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold text-lg">H</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">NutriClub</h1>
                        <p className="text-xs text-gray-500">
                            {userRole === "ANFITRION" ? "Panel Anfitrión" : "Panel Admin"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navegación */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                {filteredSections.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                            {section.title}
                        </p>
                        <div className="space-y-1">
                            {section.links.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    end={link.to === "/"}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                            ? "bg-herbalife-green/10 text-herbalife-green border-l-4 border-herbalife-green"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                        }`
                                    }
                                >
                                    <link.icon className="w-5 h-5" />
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Botón de cerrar sesión */}
            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => logout(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </div>
        </aside>
    );
}
