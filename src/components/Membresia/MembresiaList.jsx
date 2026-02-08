/**
 * 🎟️ MembresiaList.jsx
 * Lista de membresías con opciones de actualización
 */
import React, { useState, useEffect } from "react";
import { Award, Edit, TrendingUp, AlertCircle, ChevronDown, Check } from "lucide-react";
import { Listbox } from "@headlessui/react";
import Swal from "sweetalert2";
import { getAllMembresiasByClub, actualizarNivel, actualizarPuntos, actualizarEstado } from "../../services/MembresiaService";
import { getAllNivelesSocio } from "../../services/NivelSocioService";
import { getAllClubes } from "../../services/ClubService";

export default function MembresiaList() {
    const [membresias, setMembresias] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [clubes, setClubes] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState(null); // null para números
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Cargar niveles y clubes disponibles
        fetchNiveles();
        fetchClubes();
    }, []);

    useEffect(() => {
        // Cargar membresías cuando se selecciona un club
        if (selectedClubId) {
            fetchMembresias();
        }
    }, [selectedClubId]);

    const fetchClubes = async () => {
        try {
            const response = await getAllClubes();
            const clubesActivos = response.data.filter(c => c.estado === "ACTIVO");
            setClubes(clubesActivos);
        } catch (error) {
            console.error("Error al cargar clubes:", error);
        }
    };

    const fetchNiveles = async () => {
        try {
            const response = await getAllNivelesSocio();
            setNiveles(response.data);
        } catch (error) {
            console.error("Error al cargar niveles:", error);
        }
    };

    const fetchMembresias = async () => {
        try {
            setLoading(true);
            const response = await getAllMembresiasByClub(selectedClubId);
            setMembresias(response.data);
        } catch (error) {
            console.error("Error al cargar membresías:", error);
            Swal.fire("Error", "No se pudieron cargar las membresías", "error");
        } finally {
            setLoading(false);
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
                fetchMembresias(); // Recargar
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
                fetchMembresias(); // Recargar
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

            {/* Selector de Club con Headless UI */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Club para ver membresías:
                </label>

                <Listbox value={selectedClubId} onChange={setSelectedClubId}>
                    <div className="relative w-full max-w-md">
                        <Listbox.Button className="relative w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none cursor-pointer hover:border-gray-400 transition-colors">
                            <span className="block truncate text-gray-900 font-medium">
                                {selectedClubId
                                    ? (() => {
                                        const club = clubes.find(c => c.id === selectedClubId);
                                        return club ? club.nombreClub : "-- Seleccionar club --";
                                    })()
                                    : "-- Seleccionar club --"
                                }
                            </span>
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </span>
                        </Listbox.Button>

                        <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none">
                            <Listbox.Option
                                value={null}
                                className={({ active }) =>
                                    `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-herbalife-green/10 text-herbalife-dark' : 'text-gray-900'
                                    }`
                                }
                            >
                                {({ selected }) => (
                                    <>
                                        <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                            -- Seleccionar club --
                                        </span>
                                        {selected && (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-herbalife-green">
                                                <Check className="w-5 h-5" />
                                            </span>
                                        )}
                                    </>
                                )}
                            </Listbox.Option>

                            {clubes.map((club) => (
                                <Listbox.Option
                                    key={club.id}
                                    value={club.id}
                                    className={({ active }) =>
                                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${active ? 'bg-herbalife-green/10 text-herbalife-dark' : 'text-gray-900'
                                        }`
                                    }
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                {club.nombreClub}
                                            </span>
                                            {selected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-herbalife-green">
                                                    <Check className="w-5 h-5" />
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </div>
                </Listbox>
            </div>

            {/* Contenido condicional */}
            {!selectedClubId ? (
                <div className="p-8 text-center text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">
                        Selecciona un club para ver sus membresías activas
                    </p>
                </div>
            ) : loading ? (
                <div className="p-8 text-center">
                    <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Cargando...</p>
                </div>
            ) : membresias.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">
                        No hay membresías en este club
                    </p>
                </div>
            ) : (
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
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {membresia.usuarioNombre || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                        {membresia.clubNombre || "-"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                            {membresia.nivelNombre || "Básico"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {membresia.puntosAcumulados || 0} pts
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
