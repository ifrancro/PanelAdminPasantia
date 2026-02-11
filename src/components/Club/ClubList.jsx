/**
 * 📋 ClubList.jsx
 * Lista de clubes con filtros por estado y acciones administrativas
 * 
 * Estados de un club:
 * - PENDIENTE: Esperando aprobación del admin
 * - ACTIVO: Club aprobado y funcionando
 * - RECHAZADO: Solicitud rechazada
 * - INACTIVO: Club desactivado por el admin
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Store,
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    Power,
    PowerOff,
    Filter
} from "lucide-react";
import Swal from "sweetalert2";
import {
    getAllClubes,
    aprobarClub,
    rechazarClub,
    activarClub,
    desactivarClub
} from "../../services/ClubService";

export default function ClubList() {
    // === ESTADO ===
    const [clubes, setClubes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState("TODOS"); // Filtro de estado
    const navigate = useNavigate();

    // === CARGAR DATOS ===
    useEffect(() => {
        fetchClubes();
    }, []);

    const fetchClubes = async () => {
        try {
            setLoading(true);
            const response = await getAllClubes();
            setClubes(response.data);
        } catch (error) {
            console.error("Error al cargar clubes:", error);
            Swal.fire("Error", "No se pudieron cargar los clubes", "error");
        } finally {
            setLoading(false);
        }
    };

    // === FILTRAR CLUBES ===
    const clubesFiltrados = clubes.filter(club => {
        if (filtroEstado === "TODOS") return true;
        return club.estado === filtroEstado;
    });

    // === CONTAR POR ESTADO (para badges) ===
    const contarPorEstado = (estado) =>
        clubes.filter(c => c.estado === estado).length;

    // === ACCIONES ===
    const handleAprobar = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Aprobar club?",
            text: `¿Deseas aprobar "${nombre}"? El solicitante se convertirá en anfitrión.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#7CB342",
            confirmButtonText: "Sí, aprobar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await aprobarClub(id);
                Swal.fire("¡Aprobado!", "El club ha sido aprobado", "success");
                fetchClubes();
            } catch (error) {
                Swal.fire("Error", "No se pudo aprobar el club", "error");
            }
        }
    };

    const handleRechazar = async (id, nombre) => {
        const { value: motivo } = await Swal.fire({
            title: "Rechazar club",
            text: `¿Por qué rechazas "${nombre}"?`,
            input: "textarea",
            inputPlaceholder: "Ingresa el motivo del rechazo...",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Rechazar",
            cancelButtonText: "Cancelar",
        });

        if (motivo) {
            try {
                await rechazarClub(id);
                Swal.fire("Rechazado", "El club ha sido rechazado", "info");
                fetchClubes();
            } catch (error) {
                Swal.fire("Error", "No se pudo rechazar el club", "error");
            }
        }
    };

    const handleActivar = async (id) => {
        try {
            await activarClub(id);
            Swal.fire("Activado", "El club ha sido activado", "success");
            fetchClubes();
        } catch (error) {
            Swal.fire("Error", "No se pudo activar el club", "error");
        }
    };

    const handleDesactivar = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Desactivar club?",
            text: `¿Deseas desactivar "${nombre}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Sí, desactivar",
        });

        if (result.isConfirmed) {
            try {
                await desactivarClub(id);
                Swal.fire("Desactivado", "El club ha sido desactivado", "info");
                fetchClubes();
            } catch (error) {
                Swal.fire("Error", "No se pudo desactivar el club", "error");
            }
        }
    };

    // === ESTILOS DE BADGE POR ESTADO ===
    const getEstadoBadge = (estado) => {
        const estilos = {
            PENDIENTE: "bg-yellow-100 text-yellow-700",
            ACTIVO: "bg-green-100 text-green-700",
            RECHAZADO: "bg-red-100 text-red-700",
            INACTIVO: "bg-gray-100 text-gray-700",
        };
        return estilos[estado] || "bg-gray-100 text-gray-700";
    };

    // === RENDER LOADING ===
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* === HEADER CON FILTROS === */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-herbalife-green/10 rounded-lg">
                            <Store className="w-6 h-6 text-herbalife-green" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Clubes</h2>
                            <p className="text-sm text-gray-500">{clubes.length} clubes registrados</p>
                        </div>
                    </div>

                    {/* Filtros por estado */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none"
                        >
                            <option value="TODOS">Todos ({clubes.length})</option>
                            <option value="PENDIENTE">Pendientes ({contarPorEstado("PENDIENTE")})</option>
                            <option value="ACTIVO">Activos ({contarPorEstado("ACTIVO")})</option>
                            <option value="RECHAZADO">Rechazados ({contarPorEstado("RECHAZADO")})</option>
                            <option value="INACTIVO">Inactivos ({contarPorEstado("INACTIVO")})</option>
                        </select>
                    </div>
                </div>

                {/* === TARJETAS DE RESUMEN === */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-700">Pendientes</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-800 mt-1">
                            {contarPorEstado("PENDIENTE")}
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Activos</span>
                        </div>
                        <p className="text-2xl font-bold text-green-800 mt-1">
                            {contarPorEstado("ACTIVO")}
                        </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-red-700">Rechazados</span>
                        </div>
                        <p className="text-2xl font-bold text-red-800 mt-1">
                            {contarPorEstado("RECHAZADO")}
                        </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center gap-2">
                            <PowerOff className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Inactivos</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-800 mt-1">
                            {contarPorEstado("INACTIVO")}
                        </p>
                    </div>
                </div>
            </div>

            {/* === TABLA DE CLUBES === */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hub</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anfitrión</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {clubesFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No hay clubes con el filtro seleccionado
                                    </td>
                                </tr>
                            ) : (
                                clubesFiltrados.map((club) => (
                                    <tr key={club.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-800">{club.nombreClub}</p>
                                                <p className="text-sm text-gray-500">{club.direccion || "-"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {club.hubNombre || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {club.anfitrionNombre || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(club.estado)}`}>
                                                {club.estado}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {/* Ver detalle */}
                                                <button
                                                    onClick={() => navigate(`/clubes/${club.id}`)}
                                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                    title="Ver detalle"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {/* Acciones según estado */}
                                                {club.estado === "PENDIENTE" && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAprobar(club.id, club.nombreClub)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                            title="Aprobar"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRechazar(club.id, club.nombreClub)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                            title="Rechazar"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                {club.estado === "ACTIVO" && (
                                                    <button
                                                        onClick={() => handleDesactivar(club.id, club.nombreClub)}
                                                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                        title="Desactivar"
                                                    >
                                                        <PowerOff className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {club.estado === "INACTIVO" && (
                                                    <button
                                                        onClick={() => handleActivar(club.id)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                        title="Activar"
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
