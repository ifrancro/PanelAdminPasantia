/**
 * 📝 SoporteDetail.jsx
 * Vista detallada de ticket con opción de responder y cambiar estado
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, Edit } from "lucide-react";
import Swal from "sweetalert2";
import {
    getTicketById,
    responderTicket,
    cambiarEstadoTicket
} from "../../services/SoporteService";

export default function SoporteDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [respuesta, setRespuesta] = useState("");
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const response = await getTicketById(id);
            setTicket(response.data);
        } catch (error) {
            Swal.fire("Error", "No se pudo cargar el ticket", "error");
            navigate("/soporte");
        } finally {
            setLoading(false);
        }
    };

    const handleResponder = async () => {
        if (!respuesta.trim()) {
            Swal.fire("Validación", "Escribe una respuesta", "warning");
            return;
        }

        setEnviando(true);
        try {
            await responderTicket(id, respuesta);
            Swal.fire("Enviado", "Respuesta enviada al usuario", "success");
            setRespuesta("");
            fetchTicket(); // Recargar para ver la respuesta
        } catch (error) {
            Swal.fire("Error", "No se pudo enviar la respuesta", "error");
        } finally {
            setEnviando(false);
        }
    };

    const handleCambiarEstado = async (nuevoEstado) => {
        try {
            await cambiarEstadoTicket(id, nuevoEstado);
            Swal.fire("Actualizado", `Ticket marcado como ${nuevoEstado}`, "success");
            fetchTicket();
        } catch (error) {
            Swal.fire("Error", "No se pudo cambiar el estado", "error");
        }
    };

    const getEstadoBadge = (estado) => {
        const estilos = {
            ABIERTO: "bg-red-100 text-red-700",
            EN_PROCESO: "bg-yellow-100 text-yellow-700",
            CERRADO: "bg-green-100 text-green-700",
        };
        return estilos[estado] || "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate("/soporte")}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(ticket.estado)}`}>
                                {ticket.estado}
                            </span>
                            <span className="text-sm text-gray-500">Ticket #{ticket.id}</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {ticket.asunto || "Sin asunto"}
                        </h2>
                    </div>
                </div>

                {/* Info del usuario */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-xs text-gray-500">Usuario</p>
                        <p className="font-medium text-gray-800">
                            {ticket.usuario?.nombre} {ticket.usuario?.apellido}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">
                            {ticket.usuario?.email || "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Fecha Creación</p>
                        <p className="font-medium text-gray-800">
                            {ticket.fechaCreacion ? new Date(ticket.fechaCreacion).toLocaleString() : "-"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">Última Actualización</p>
                        <p className="font-medium text-gray-800">
                            {ticket.fechaActualizacion ? new Date(ticket.fechaActualizacion).toLocaleString() : "-"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-3">Descripción del Problema</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                    {ticket.descripcion || "Sin descripción"}
                </p>
            </div>

            {/* Respuesta del admin (si existe) */}
            {ticket.respuesta && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h3 className="font-semibold text-green-800 mb-3">Respuesta del Administrador</h3>
                    <p className="text-green-900 whitespace-pre-wrap">
                        {ticket.respuesta}
                    </p>
                </div>
            )}

            {/* Formulario de respuesta */}
            {ticket.estado !== "CERRADO" && (
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Responder al Usuario</h3>
                    <textarea
                        value={respuesta}
                        onChange={(e) => setRespuesta(e.target.value)}
                        rows="5"
                        placeholder="Escribe tu respuesta..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none resize-none"
                    />
                    <button
                        onClick={handleResponder}
                        disabled={enviando}
                        className="mt-3 flex items-center gap-2 px-6 py-3 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark disabled:opacity-50 font-medium"
                    >
                        {enviando ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        {enviando ? "Enviando..." : "Enviar Respuesta"}
                    </button>
                </div>
            )}

            {/* Acciones de estado */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="font-semibold text-gray-800 mb-4">Cambiar Estado</h3>
                <div className="flex gap-3">
                    {ticket.estado !== "EN_PROCESO" && (
                        <button
                            onClick={() => handleCambiarEstado("EN_PROCESO")}
                            className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-medium"
                        >
                            Marcar En Proceso
                        </button>
                    )}
                    {ticket.estado !== "CERRADO" && (
                        <button
                            onClick={() => handleCambiarEstado("CERRADO")}
                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium"
                        >
                            Cerrar Ticket
                        </button>
                    )}
                    {ticket.estado !== "ABIERTO" && (
                        <button
                            onClick={() => handleCambiarEstado("ABIERTO")}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
                        >
                            Reabrir
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
