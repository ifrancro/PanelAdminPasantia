import React from "react";
import { ShieldX } from "lucide-react";

/**
 * Pantalla mínima 403: autenticado pero sin permiso para la ruta.
 * No cierra sesión ni redirige (evita loops con rutas ADMIN-only).
 */
export default function AccessDenied() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[40vh] p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 max-w-md text-center">
                <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <ShieldX className="w-7 h-7 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso denegado</h2>
                <p className="text-gray-500 text-sm">
                    No tienes permisos para acceder a esta sección del panel.
                </p>
            </div>
        </div>
    );
}
