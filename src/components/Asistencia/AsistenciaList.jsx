/**
 * 📊 AsistenciaList.jsx
 * Lista de registros de asistencia (solo lectura)
 */
import React, { useEffect, useState } from "react";
import { CalendarCheck, Users, Store } from "lucide-react";
import Swal from "sweetalert2";
import { getAllAsistencias } from "../../services/AsistenciaService";

// El backend envía LocalDateTime sin zona (UTC en el servidor). Lo marcamos
// como UTC con 'Z' y lo formateamos explícitamente en hora de Bolivia.
const formatoBolivia = new Intl.DateTimeFormat("es-BO", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

const formatFechaHoraBolivia = (valor) => {
    if (!valor) return "-";
    const iso = typeof valor === "string" && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(valor)
        ? `${valor}Z`
        : valor;
    const fecha = new Date(iso);
    return Number.isNaN(fecha.getTime()) ? "-" : formatoBolivia.format(fecha);
};

export default function AsistenciaList() {
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAsistencias();
    }, []);

    const fetchAsistencias = async () => {
        try {
            setLoading(true);
            const response = await getAllAsistencias();

            // 🔍 DEBUG: Log the entire response to see the actual structure
            console.log("=== DEBUG: API Response ===");
            console.log("Full response:", response);
            console.log("response.data:", response.data);
            console.log("First item:", response.data?.[0]);
            console.log("========================");

            setAsistencias(response.data);
        } catch (error) {
            console.error("Error al cargar asistencias:", error);
            Swal.fire("Error", "No se pudieron cargar las asistencias", "error");
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
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <CalendarCheck className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Registros de Asistencia</h2>
                        <p className="text-sm text-gray-500">{asistencias.length} registros</p>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Socio</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verificado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {asistencias.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No hay registros de asistencia
                                </td>
                            </tr>
                        ) : (
                            asistencias.map((asistencia) => (
                                <tr key={asistencia.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-800">
                                        {formatFechaHoraBolivia(asistencia.fechaHora)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-800">
                                                {asistencia.membresiaNumeroSocio || "Socio desconocido"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-800">
                                                {asistencia.clubNombre || "Club desconocido"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${asistencia.estado === 'CONFIRMADA'
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-700"
                                            }`}>
                                            {asistencia.estado === 'CONFIRMADA' ? "Verificado" : asistencia.estado || "Pendiente"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
