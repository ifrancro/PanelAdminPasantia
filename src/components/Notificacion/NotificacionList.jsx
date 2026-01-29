/**
 * 📋 NotificacionList.jsx
 * Historial de notificaciones enviadas
 */
import React, { useEffect, useState } from "react";
import { Bell, Clock, Users } from "lucide-react";
import Swal from "sweetalert2";
import { getHistorialNotificaciones } from "../../services/NotificacionService";

export default function NotificacionList() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistorial();
    }, []);

    const fetchHistorial = async () => {
        try {
            setLoading(true);
            const response = await getHistorialNotificaciones();
            setNotificaciones(response.data);
        } catch (error) {
            console.error("Error al cargar historial:", error);
            Swal.fire("Error", "No se pudo cargar el historial", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Bell className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Historial de Notificaciones</h2>
                        <p className="text-sm text-gray-500">{notificaciones.length} notificaciones enviadas</p>
                    </div>
                </div>
            </div>

            <div className="divide-y divide-gray-200">
                {notificaciones.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No hay notificaciones en el historial
                    </div>
                ) : (
                    notificaciones.map((notif) => (
                        <div key={notif.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-indigo-100 rounded-lg flex-shrink-0">
                                    <Bell className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800">
                                        {notif.titulo}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {notif.mensaje}
                                    </p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {notif.fechaEnvio ? new Date(notif.fechaEnvio).toLocaleString() : "Fecha no disponible"}
                                        </div>
                                        {notif.tipo && (
                                            <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                {notif.tipo}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
