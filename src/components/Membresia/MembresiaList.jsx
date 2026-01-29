/**
 * 🎟️ MembresiaList.jsx
 * Lista de membresías con opciones de actualización
 */
import React, { useState } from "react";
import { Award, Edit, TrendingUp } from "lucide-react";
import Swal from "sweetalert2";
import { actualizarNivel, actualizarPuntos } from "../../services/MembresiaService";
import { getAllNivelesSocio } from "../../services/NivelSocioService";

export default function MembresiaList() {
    // Estado de ejemplo - en producción cargarías esto desde un endpoint
    // que retorne todas las membresías
    const [membresias, setMembresias] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        // Cargar niveles disponibles
        fetchNiveles();
    }, []);

    const fetchNiveles = async () => {
        try {
            const response = await getAllNivelesSocio();
            setNiveles(response.data);
        } catch (error) {
            console.error("Error al cargar niveles:", error);
        }
    };

    const handleActualizarPuntos = async (membresiaId, puntosActuales) => {
        const result = await Swal.fire({
            title: "Actualizar Puntos",
            html: `
                <input 
                    id="swal-input-puntos" 
                    type="number" 
                    class="swal2-input" 
                    placeholder="Nuevos puntos"
                    value="${puntosActuales || 0}"
                >
            `,
            showCancelButton: true,
            confirmButtonText: "Actualizar",
            confirmButtonColor: "#7CB342",
            preConfirm: () => {
                const puntos = document.getElementById("swal-input-puntos").value;
                if (!puntos || puntos < 0) {
                    Swal.showValidationMessage("Ingresa puntos válidos");
                    return false;
                }
                return parseInt(puntos);
            },
        });

        if (result.isConfirmed) {
            try {
                await actualizarPuntos(membresiaId, result.value);
                Swal.fire("Actualizado", "Puntos actualizados correctamente", "success");
                // Aquí deberías recargar las membresías
            } catch (error) {
                Swal.fire("Error", "No se pudieron actualizar los puntos", "error");
            }
        }
    };

    const handleActualizarNivel = async (membresiaId, nivelActualId) => {
        const opcionesNiveles = niveles.map(n =>
            `<option value="${n.id}" ${n.id === nivelActualId ? 'selected' : ''}>${n.nombre}</option>`
        ).join('');

        const result = await Swal.fire({
            title: "Cambiar Nivel",
            html: `
                <select id="swal-select-nivel" class="swal2-select">
                    ${opcionesNiveles}
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: "Cambiar",
            confirmButtonColor: "#7CB342",
            preConfirm: () => {
                return document.getElementById("swal-select-nivel").value;
            },
        });

        if (result.isConfirmed) {
            try {
                await actualizarNivel(membresiaId, parseInt(result.value));
                Swal.fire("Actualizado", "Nivel actualizado correctamente", "success");
                // Aquí deberías recargar las membresías
            } catch (error) {
                Swal.fire("Error", "No se pudo actualizar el nivel", "error");
            }
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Membresías Activas</h2>
                        <p className="text-sm text-gray-500">
                            Vista de solo lectura · Actualización manual de nivel/puntos
                        </p>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-6 bg-blue-50 border-b border-blue-100">
                <p className="text-sm text-blue-800">
                    ℹ️ <strong>Nota:</strong> Las membresías se crean automáticamente cuando un socio se activa.
                    Aquí solo puedes ajustar nivel o puntos manualmente (admin override).
                </p>
            </div>

            {/* Placeholder - en producción cargarías esto desde la API */}
            <div className="p-8 text-center text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">
                    Para ver membresías activas, necesitas implementar el endpoint<br />
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">GET /membresias</code>
                </p>
                <p className="text-xs text-gray-400 mt-2">
                    Actualmente el backend solo tiene consultas por ID o por usuario
                </p>
            </div>

            {/* Tabla de ejemplo (oculta por ahora) */}
            {membresias.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puntos</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {membresias.map((membresia) => (
                                <tr key={membresia.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-800">
                                        {membresia.usuario?.nombre} {membresia.usuario?.apellido}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {membresia.club?.nombre || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                            {membresia.nivelSocio?.nombre || "Básico"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                                        {membresia.puntos || 0} pts
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleActualizarPuntos(membresia.id, membresia.puntos)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Actualizar puntos"
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleActualizarNivel(membresia.id, membresia.nivelSocio?.id)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                                                title="Cambiar nivel"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
