/**
 * 🎫 SoporteList.jsx
 * Lista de tickets de soporte con filtros por estado
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Eye, Clock, CheckCircle, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { getAllTickets } from "../../services/SoporteService";

export default function SoporteList() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState("TODOS");
    const navigate = useNavigate();

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await getAllTickets();
            setTickets(response.data);
        } catch (error) {
            console.error("Error al cargar tickets:", error);
            Swal.fire("Error", "No se pudieron cargar los tickets", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filtrar tickets
    const ticketsFiltrados = tickets.filter(ticket => {
        if (filtroEstado === "TODOS") return true;
        return ticket.estado === filtroEstado;
    });

    // Contar por estado
    const contarPorEstado = (estado) =>
        tickets.filter(t => t.estado === estado).length;

    // Badge de estado
    const getEstadoBadge = (estado) => {
        const estilos = {
            ABIERTO: "bg-red-100 text-red-700",
            EN_PROCESO: "bg-yellow-100 text-yellow-700",
            CERRADO: "bg-green-100 text-green-700",
        };
        return estilos[estado] || "bg-gray-100 text-gray-700";
    };

    // Icono de estado
    const getEstadoIcon = (estado) => {
        switch (estado) {
            case "ABIERTO": return <AlertCircle className="w-4 h-4" />;
            case "EN_PROCESO": return <Clock className="w-4 h-4" />;
            case "CERRADO": return <CheckCircle className="w-4 h-4" />;
            default: return null;
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
        <div className="space-y-6">
            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-gray-500">
                    <p className="text-sm text-gray-500 font-medium">Total</p>
                    <p className="text-2xl font-bold text-gray-800">{tickets.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-red-500">
                    <p className="text-sm text-gray-500 font-medium">Abiertos</p>
                    <p className="text-2xl font-bold text-gray-800">{contarPorEstado("ABIERTO")}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-500 font-medium">En Proceso</p>
                    <p className="text-2xl font-bold text-gray-800">{contarPorEstado("EN_PROCESO")}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-md border-l-4 border-green-500">
                    <p className="text-sm text-gray-500 font-medium">Cerrados</p>
                    <p className="text-2xl font-bold text-gray-800">{contarPorEstado("CERRADO")}</p>
                </div>
            </div>

            {/* Lista de tickets */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Tickets de Soporte</h2>
                                <p className="text-sm text-gray-500">{ticketsFiltrados.length} tickets</p>
                            </div>
                        </div>

                        {/* Filtro por estado */}
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none"
                        >
                            <option value="TODOS">Todos ({tickets.length})</option>
                            <option value="ABIERTO">Abiertos ({contarPorEstado("ABIERTO")})</option>
                            <option value="EN_PROCESO">En Proceso ({contarPorEstado("EN_PROCESO")})</option>
                            <option value="CERRADO">Cerrados ({contarPorEstado("CERRADO")})</option>
                        </select>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {ticketsFiltrados.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No hay tickets con el filtro seleccionado
                        </div>
                    ) : (
                        ticketsFiltrados.map((ticket) => (
                            <div key={ticket.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEstadoBadge(ticket.estado)}`}>
                                                {getEstadoIcon(ticket.estado)}
                                                {ticket.estado}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                #{ticket.id}
                                            </span>
                                        </div>
                                        <h3 className="font-semibold text-gray-800 mb-1">
                                            {ticket.asunto || "Sin asunto"}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {ticket.descripcion || "Sin descripción"}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                            <span>Usuario: {ticket.usuario?.nombre} {ticket.usuario?.apellido}</span>
                                            {ticket.fechaCreacion && (
                                                <span>
                                                    {new Date(ticket.fechaCreacion).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/soporte/${ticket.id}`)}
                                        className="flex items-center gap-2 px-4 py-2 text-herbalife-green hover:bg-herbalife-green/10 rounded-lg font-medium transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
