import React from "react";
import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSidebarSections } from "../routes/routeConfig";
import expandeIcono from "../assets/expande-icono.png";

/**
 * 📑 Sidebar — navegación derivada de routeConfig (WEB-AUTH-002).
 */
export default function Sidebar() {
    const { user, logout } = useAuth();
    const menuSections = getSidebarSections(user);

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="px-6 py-5 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <img src={expandeIcono} alt="Expande" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Expande</h1>
                        <p className="text-xs text-gray-500">Panel Admin</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-6">
                {menuSections.map((section) => (
                    <div key={section.title}>
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

            <div className="p-4 border-t border-gray-200">
                <button
                    type="button"
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
