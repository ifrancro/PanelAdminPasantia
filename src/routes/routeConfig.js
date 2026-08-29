import {
    Home,
    Store,
    Users,
    UserCheck,
    Package,
    CalendarCheck,
    Calendar,
    HeadphonesIcon,
    Layers,
    FileText,
} from "lucide-react";
import { ROLES, hasRole } from "../utils/roles";

import Dashboard from "../pages/Dashboard";
import ClubPage from "../pages/ClubPage";
import UsuarioPage from "../pages/UsuarioPage";
import MembresiaPage from "../pages/MembresiaPage";
import ProductoPage from "../pages/ProductoPage";
import NivelSocioPage from "../pages/NivelSocioPage";
import AsistenciaPage from "../pages/AsistenciaPage";
import EventoPage from "../pages/EventoPage";
import SoportePage from "../pages/SoportePage";
import ReportsPage from "../pages/Reports/ReportsPage";

const ADMIN_ONLY = [ROLES.ADMIN];

/**
 * Configuración central de rutas del panel y menú lateral.
 * allowedRoles: autorización (RoleProtectedRoute).
 * showInSidebar + sidebar*: navegación (Sidebar).
 */
export const routeConfig = [
    {
        id: "dashboard",
        path: "",
        index: true,
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Principal",
        sidebarLabel: "Dashboard",
        sidebarTo: "/",
        icon: Home,
        Component: Dashboard,
    },
    {
        id: "clubes",
        path: "clubes/*",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Estructura",
        sidebarLabel: "Clubes",
        sidebarTo: "/clubes",
        icon: Store,
        Component: ClubPage,
    },
    {
        id: "usuarios",
        path: "usuarios/*",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Usuarios",
        sidebarLabel: "Usuarios",
        sidebarTo: "/usuarios",
        icon: Users,
        Component: UsuarioPage,
    },
    {
        id: "membresias",
        path: "membresias/*",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Usuarios",
        sidebarLabel: "Membresías",
        sidebarTo: "/membresias",
        icon: UserCheck,
        Component: MembresiaPage,
    },
    {
        id: "productos",
        path: "productos/*",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Catálogo",
        sidebarLabel: "Productos",
        sidebarTo: "/productos",
        icon: Package,
        Component: ProductoPage,
    },
    {
        id: "niveles-socio",
        path: "niveles-socio/*",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Catálogo",
        sidebarLabel: "Niveles Socio",
        sidebarTo: "/niveles-socio",
        icon: Layers,
        Component: NivelSocioPage,
    },
    {
        id: "asistencias",
        path: "asistencias/*",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Operaciones",
        sidebarLabel: "Asistencias",
        sidebarTo: "/asistencias",
        icon: CalendarCheck,
        Component: AsistenciaPage,
    },
    {
        id: "eventos",
        path: "eventos/*",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Comunicación",
        sidebarLabel: "Eventos",
        sidebarTo: "/eventos",
        icon: Calendar,
        Component: EventoPage,
    },
    {
        id: "soporte",
        path: "soporte/*",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Soporte",
        sidebarLabel: "Tickets",
        sidebarTo: "/soporte",
        icon: HeadphonesIcon,
        Component: SoportePage,
    },
    {
        id: "reportes",
        path: "reportes",
        allowedRoles: ADMIN_ONLY,
        showInSidebar: true,
        sidebarSection: "Reportes",
        sidebarLabel: "Reportes",
        sidebarTo: "/reportes",
        icon: FileText,
        Component: ReportsPage,
    },
];

/**
 * Secciones del Sidebar derivadas de routeConfig y rol del usuario.
 * @param {object|null|undefined} user
 * @returns {{ title: string, links: { to: string, label: string, icon: import('react').ComponentType }[] }[]}
 */
export function getSidebarSections(user) {
    const sectionMap = new Map();

    for (const route of routeConfig) {
        if (!route.showInSidebar || !hasRole(user, route.allowedRoles)) {
            continue;
        }

        if (!sectionMap.has(route.sidebarSection)) {
            sectionMap.set(route.sidebarSection, []);
        }

        sectionMap.get(route.sidebarSection).push({
            to: route.sidebarTo,
            label: route.sidebarLabel,
            icon: route.icon,
        });
    }

    const sectionOrder = [
        "Principal",
        "Estructura",
        "Usuarios",
        "Catálogo",
        "Operaciones",
        "Comunicación",
        "Soporte",
        "Reportes",
    ];

    return sectionOrder
        .filter((title) => sectionMap.has(title))
        .map((title) => ({
            title,
            links: sectionMap.get(title),
        }));
}
