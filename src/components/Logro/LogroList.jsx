import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, Pencil, Trash2, Trophy,
    CheckCircle, XCircle, Clock, Star, Calendar
} from "lucide-react";
import Swal from "sweetalert2";
import { getAllLogros, deleteLogro, cambiarEstadoAprobacionLogro } from "../../services/LogroService";

// ─── Helpers ────────────────────────────────────────────────────────────────

const APROBACION_BADGE = {
    APROBADO: { cls: "bg-green-100 text-green-700", label: "Aprobado" },
    PENDIENTE: { cls: "bg-yellow-100 text-yellow-700", label: "Pendiente" },
    RECHAZADO: { cls: "bg-red-100 text-red-600", label: "Rechazado" },
};

const METRICA_BADGE = {
    ASISTENCIA: { cls: "bg-blue-100 text-blue-700", emoji: "📅" },
    CONSUMO: { cls: "bg-purple-100 text-purple-700", emoji: "🛒" },
    REFERIDOS: { cls: "bg-orange-100 text-orange-700", emoji: "👥" },
};

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const [y, m, d] = String(dateStr).split("T")[0].split("-");
    return `${d}/${m}/${y}`;
};

// ─── Componente principal ───────────────────────────────────────────────────

export default function LogroList() {
    const [logros, setLogros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("todos"); // "todos" | "pendientes"
    const [loadingAprobacion, setLoadingAprobacion] = useState({}); // { [id]: true }
    const navigate = useNavigate();

    useEffect(() => { fetchLogros(); }, []);

    const fetchLogros = async () => {
        try {
            setLoading(true);
            const response = await getAllLogros();
            setLogros(response.data);
        } catch {
            Swal.fire("Error", "No se pudieron cargar los logros", "error");
        } finally {
            setLoading(false);
        }
    };

    const pendientes = logros.filter(l => l.estadoAprobacion === "PENDIENTE");

    // ── Aprobar / Rechazar ──────────────────────────────────────────────────

    const handleAprobacion = async (logro, nuevoEstado) => {
        const esAprobado = nuevoEstado === "APROBADO";
        const result = await Swal.fire({
            title: esAprobado ? "¿Aprobar logro?" : "¿Rechazar logro?",
            text: `"${logro.nombre}"${logro.clubCreadorNombre ? ` — solicitado por ${logro.clubCreadorNombre}` : ""}`,
            icon: esAprobado ? "question" : "warning",
            showCancelButton: true,
            confirmButtonColor: esAprobado ? "#16a34a" : "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: esAprobado ? "Sí, aprobar" : "Sí, rechazar",
            cancelButtonText: "Cancelar",
        });
        if (!result.isConfirmed) return;

        setLoadingAprobacion(prev => ({ ...prev, [logro.id]: true }));
        try {
            await cambiarEstadoAprobacionLogro(logro.id, nuevoEstado);
            // Actualizar el estado en la lista local sin refetch
            setLogros(prev =>
                prev.map(l => l.id === logro.id ? { ...l, estadoAprobacion: nuevoEstado } : l)
            );
            Swal.fire({
                icon: "success",
                title: esAprobado ? "Logro aprobado" : "Logro rechazado",
                text: `"${logro.nombre}" fue ${esAprobado ? "aprobado" : "rechazado"} correctamente.`,
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            const status = err?.response?.status;
            Swal.fire(
                "Error",
                status === 403
                    ? "No tienes permisos para realizar esta acción."
                    : "No se pudo cambiar el estado del logro.",
                "error"
            );
        } finally {
            setLoadingAprobacion(prev => ({ ...prev, [logro.id]: false }));
        }
    };

    // ── Eliminar ────────────────────────────────────────────────────────────

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Eliminar logro?",
            text: `¿Estás seguro de eliminar "${nombre}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });
        if (!result.isConfirmed) return;
        try {
            await deleteLogro(id);
            Swal.fire({ icon: "success", title: "Eliminado", text: "El logro fue eliminado.", timer: 1800, showConfirmButton: false });
            fetchLogros();
        } catch {
            Swal.fire("Error", "No se pudo eliminar el logro", "error");
        }
    };

    // ── Loading ─────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">

            {/* ── Header ── */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Logros</h2>
                        <p className="text-sm text-gray-500">{logros.length} registros totales</p>
                    </div>
                    {/* Badge pendientes en el header */}
                    {pendientes.length > 0 && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => navigate("/logros/create")}
                    className="flex items-center gap-2 px-4 py-2 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Logro Global
                </button>
            </div>

            {/* ── Tabs ── */}
            <div className="flex border-b border-gray-200 px-6">
                <button
                    onClick={() => setTab("todos")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                        ${tab === "todos"
                            ? "border-herbalife-green text-herbalife-green"
                            : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    <Trophy className="w-4 h-4" />
                    Todos los Logros
                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">{logros.length}</span>
                </button>
                <button
                    onClick={() => setTab("pendientes")}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                        ${tab === "pendientes"
                            ? "border-yellow-500 text-yellow-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"}`}
                >
                    <Clock className="w-4 h-4" />
                    Solicitudes Pendientes
                    {pendientes.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                            {pendientes.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ══ TAB: TODOS LOS LOGROS ══ */}
            {tab === "todos" && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Métrica</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logros.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-5 py-8 text-center text-gray-400">
                                        No hay logros registrados
                                    </td>
                                </tr>
                            ) : (
                                logros.map(logro => {
                                    const aprobacion = APROBACION_BADGE[logro.estadoAprobacion] || { cls: "bg-gray-100 text-gray-500", label: logro.estadoAprobacion || "—" };
                                    const metrica = METRICA_BADGE[logro.tipoMetrica];
                                    const isPending = logro.estadoAprobacion === "PENDIENTE";
                                    return (
                                        <tr key={logro.id} className={isPending ? "bg-yellow-50/40 hover:bg-yellow-50" : "hover:bg-gray-50"}>
                                            <td className="px-5 py-3 text-sm text-gray-500">{logro.id}</td>
                                            <td className="px-5 py-3">
                                                <p className="text-sm font-medium text-gray-800">{logro.nombre}</p>
                                                {logro.descripcion && (
                                                    <p className="text-xs text-gray-400 truncate max-w-xs">{logro.descripcion}</p>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-sm text-gray-600">
                                                {logro.clubCreadorNombre
                                                    ? <span className="font-medium">{logro.clubCreadorNombre}</span>
                                                    : <span className="text-xs text-gray-400 italic">Global</span>}
                                            </td>
                                            <td className="px-5 py-3">
                                                {metrica ? (
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${metrica.cls}`}>
                                                        {metrica.emoji} {logro.tipoMetrica}
                                                        {logro.metaCantidad ? ` ×${logro.metaCantidad}` : ""}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-gray-500">
                                                {logro.fechaInicio || logro.fechaFin ? (
                                                    <span>{formatDate(logro.fechaInicio)} → {formatDate(logro.fechaFin)}</span>
                                                ) : "—"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${aprobacion.cls}`}>
                                                    {aprobacion.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                {/* Botones aprobar/rechazar si está pendiente */}
                                                {isPending && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAprobacion(logro, "APROBADO")}
                                                            disabled={loadingAprobacion[logro.id]}
                                                            title="Aprobar"
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg mr-1 disabled:opacity-40"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAprobacion(logro, "RECHAZADO")}
                                                            disabled={loadingAprobacion[logro.id]}
                                                            title="Rechazar"
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg mr-1 disabled:opacity-40"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/logros/edit/${logro.id}`)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-1"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(logro.id, logro.nombre)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ══ TAB: SOLICITUDES PENDIENTES ══ */}
            {tab === "pendientes" && (
                <div>
                    {pendientes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                            <CheckCircle className="w-12 h-12 text-green-300" />
                            <p className="text-lg font-medium">¡Todo al día!</p>
                            <p className="text-sm">No hay logros pendientes de aprobación.</p>
                        </div>
                    ) : (
                        <>
                            {/* Banner informativo */}
                            <div className="mx-6 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>
                                    <strong>{pendientes.length} logro{pendientes.length !== 1 ? "s" : ""}</strong> esperando tu revisión.
                                    Los logros aprobados estarán disponibles para los socios del club solicitante.
                                </span>
                            </div>

                            <div className="overflow-x-auto mt-4">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club Solicitante</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Logro</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Vigencia</div>
                                            </th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">El Reto</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                                <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Premio</div>
                                            </th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Decisión</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pendientes.map(logro => {
                                            const metrica = METRICA_BADGE[logro.tipoMetrica];
                                            const isProcessing = loadingAprobacion[logro.id];
                                            return (
                                                <tr key={logro.id} className="hover:bg-yellow-50/50 bg-yellow-50/20">
                                                    {/* Club */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-herbalife-green/10 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xs font-bold text-herbalife-green">
                                                                    {logro.clubCreadorNombre?.charAt(0) || "?"}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {logro.clubCreadorNombre || <span className="text-gray-400 italic">Sin club</span>}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Nombre + descripción */}
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-semibold text-gray-800">{logro.nombre}</p>
                                                        {logro.descripcion && (
                                                            <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{logro.descripcion}</p>
                                                        )}
                                                    </td>

                                                    {/* Vigencia */}
                                                    <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-xs text-gray-400">Inicio: <span className="text-gray-700 font-medium">{formatDate(logro.fechaInicio)}</span></span>
                                                            <span className="text-xs text-gray-400">Fin: <span className="text-gray-700 font-medium">{formatDate(logro.fechaFin)}</span></span>
                                                        </div>
                                                    </td>

                                                    {/* Reto: tipoMetrica + metaCantidad */}
                                                    <td className="px-5 py-4">
                                                        {metrica ? (
                                                            <div className="flex flex-col gap-1">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold w-fit ${metrica.cls}`}>
                                                                    {metrica.emoji} {logro.tipoMetrica}
                                                                </span>
                                                                {logro.metaCantidad && (
                                                                    <span className="text-xs text-gray-500">
                                                                        Meta: <strong className="text-gray-700">{logro.metaCantidad}</strong>
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No especificado</span>
                                                        )}
                                                    </td>

                                                    {/* Premio: puntosRecompensa */}
                                                    <td className="px-5 py-4">
                                                        {logro.puntosRecompensa ? (
                                                            <div className="flex items-center gap-1 text-yellow-600">
                                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                                                <span className="text-sm font-bold">{logro.puntosRecompensa}</span>
                                                                <span className="text-xs text-gray-400">pts</span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        )}
                                                    </td>

                                                    {/* Botones */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleAprobacion(logro, "APROBADO")}
                                                                disabled={isProcessing}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
                                                            >
                                                                {isProcessing ? (
                                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                                )}
                                                                Aprobar
                                                            </button>
                                                            <button
                                                                onClick={() => handleAprobacion(logro, "RECHAZADO")}
                                                                disabled={isProcessing}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors"
                                                            >
                                                                {isProcessing ? (
                                                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                ) : (
                                                                    <XCircle className="w-3.5 h-3.5" />
                                                                )}
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
