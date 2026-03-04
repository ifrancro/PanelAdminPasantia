import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Trophy, CheckCircle, XCircle } from "lucide-react";
import Swal from "sweetalert2";
import { getAllLogros, deleteLogro, cambiarEstadoAprobacionLogro } from "../../services/LogroService";

const ESTADO_BADGE = {
    APROBADO: "bg-green-100 text-green-700 border-green-300",
    PENDIENTE: "bg-yellow-100 text-yellow-700 border-yellow-300",
    RECHAZADO: "bg-red-100 text-red-700 border-red-300",
};

export default function LogroList() {
    const [logros, setLogros] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchLogros();
    }, []);

    const fetchLogros = async () => {
        try {
            setLoading(true);
            const response = await getAllLogros();
            setLogros(response.data);
        } catch (error) {
            console.error("Error al cargar logros:", error);
            Swal.fire("Error", "No se pudieron cargar los logros", "error");
        } finally {
            setLoading(false);
        }
    };

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
        if (result.isConfirmed) {
            try {
                await deleteLogro(id);
                Swal.fire("Eliminado", "El logro ha sido eliminado", "success");
                fetchLogros();
            } catch {
                Swal.fire("Error", "No se pudo eliminar el logro", "error");
            }
        }
    };

    const handleAprobacion = async (id, nuevoEstado, nombre) => {
        const label = nuevoEstado === "APROBADO" ? "aprobar" : "rechazar";
        const result = await Swal.fire({
            title: `¿${nuevoEstado === "APROBADO" ? "Aprobar" : "Rechazar"} logro?`,
            text: `"${nombre}" será ${label}do`,
            icon: nuevoEstado === "APROBADO" ? "question" : "warning",
            showCancelButton: true,
            confirmButtonColor: nuevoEstado === "APROBADO" ? "#16a34a" : "#dc2626",
            confirmButtonText: `Sí, ${label}`,
            cancelButtonText: "Cancelar",
        });
        if (result.isConfirmed) {
            try {
                await cambiarEstadoAprobacionLogro(id, nuevoEstado);
                Swal.fire(
                    nuevoEstado === "APROBADO" ? "¡Aprobado!" : "Rechazado",
                    `El logro ha sido ${label}do`,
                    nuevoEstado === "APROBADO" ? "success" : "info"
                );
                fetchLogros();
            } catch {
                Swal.fire("Error", "No se pudo cambiar el estado", "error");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    const pendienteCount = logros.filter(l => l.estadoAprobacion === "PENDIENTE").length;

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Logros</h2>
                        <p className="text-sm text-gray-500">
                            {logros.length} registros
                            {pendienteCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                                    {pendienteCount} pendiente{pendienteCount > 1 ? "s" : ""}
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/logros/create")}
                    className="flex items-center gap-2 px-4 py-2 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Logro
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Métrica</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requisito</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logros.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                    No hay logros registrados
                                </td>
                            </tr>
                        ) : (
                            logros.map((logro) => {
                                const esPendiente = logro.estadoAprobacion === "PENDIENTE";
                                return (
                                    <tr key={logro.id}
                                        className={`hover:bg-gray-50 ${esPendiente ? "bg-yellow-50" : ""}`}>
                                        <td className="px-4 py-4 text-sm text-gray-600">{logro.id}</td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {logro.iconoUrl && (
                                                    <img src={logro.iconoUrl} alt="" className="w-6 h-6 rounded" onError={e => e.target.style.display = 'none'} />
                                                )}
                                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                                    {logro.nombre}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {logro.tipoMetrica || "-"}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {logro.tipoRequisito != null ? `${logro.tipoRequisito} asist.` : "-"}
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600">
                                            {logro.fechaInicio && logro.fechaFin
                                                ? `${logro.fechaInicio} → ${logro.fechaFin}`
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${ESTADO_BADGE[logro.estadoAprobacion] || "bg-gray-100 text-gray-600 border-gray-300"}`}>
                                                {logro.estadoAprobacion || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Aprobar / Rechazar (solo si PENDIENTE) */}
                                                {esPendiente && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAprobacion(logro.id, "APROBADO", logro.nombre)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                                            title="Aprobar">
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAprobacion(logro.id, "RECHAZADO", logro.nombre)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                                            title="Rechazar">
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => navigate(`/logros/edit/${logro.id}`)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Editar">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(logro.id, logro.nombre)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Eliminar">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
