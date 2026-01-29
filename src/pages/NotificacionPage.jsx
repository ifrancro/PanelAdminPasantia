/**
 * 📄 NotificacionPage.jsx
 * Página wrapper para notificaciones (enviar + historial)
 */
import React, { useState } from "react";
import { Send, History } from "lucide-react";
import NotificacionForm from "../components/Notificacion/NotificacionForm";
import NotificacionList from "../components/Notificacion/NotificacionList";

export default function NotificacionPage() {
    const [vista, setVista] = useState("enviar"); // "enviar" o "historial"

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-md p-2 flex gap-2">
                <button
                    onClick={() => setVista("enviar")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${vista === "enviar"
                            ? "bg-herbalife-green text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <Send className="w-4 h-4" />
                    Enviar Notificación
                </button>
                <button
                    onClick={() => setVista("historial")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${vista === "historial"
                            ? "bg-herbalife-green text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <History className="w-4 h-4" />
                    Historial
                </button>
            </div>

            {/* Contenido según vista */}
            {vista === "enviar" ? <NotificacionForm /> : <NotificacionList />}
        </div>
    );
}
