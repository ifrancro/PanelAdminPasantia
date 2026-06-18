/**
 * 🎟️ MembresiaList.jsx
 * Lista de membresías con opciones de actualización
 */
import React, { useState, useEffect, useMemo } from "react";
import { Award, Edit, TrendingUp, AlertCircle, ChevronDown, Check, Network, Search, User } from "lucide-react";
import { Listbox } from "@headlessui/react";
import Swal from "sweetalert2";
import { getAllMembresiasByClub, actualizarNivel, actualizarPuntos, actualizarEstado } from "../../services/MembresiaService";
import { getAllNivelesSocio } from "../../services/NivelSocioService";
import { getAllClubes } from "../../services/ClubService";
import ArbolReferidosModal from "./ArbolReferidosModal";

export default function MembresiaList() {
    const [membresias, setMembresias] = useState([]);
    const [niveles, setNiveles] = useState([]);
    const [clubes, setClubes] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [arbolMembresiaId, setArbolMembresiaId] = useState(null);
    const [arbolNombreSocio, setArbolNombreSocio] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredMembresias = useMemo(() => {
        if (!searchTerm) return membresias;
        const lowerSearch = searchTerm.toLowerCase();
        return membresias.filter(m => 
            (m.usuarioNombre || "").toLowerCase().includes(lowerSearch) ||
            (m.clubNombre || "").toLowerCase().includes(lowerSearch) ||
            (m.nivelNombre || "").toLowerCase().includes(lowerSearch)
        );
    }, [membresias, searchTerm]);

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
                    min="0"
                    max="999999"
                    value="${puntosActuales || 0}"
                >
            `,
            showCancelButton: true,
            confirmButtonText: "Actualizar",
            confirmButtonColor: "#1B5E20",
            preConfirm: () => {
                const puntos = document.getElementById("swal-input-puntos").value;
                if (!puntos || puntos < 0) {
                    Swal.showValidationMessage("Ingresa puntos válidos (mínimo 0)");
                    return false;
                }
                if (puntos > 999999) {
                    Swal.showValidationMessage("Los puntos no pueden exceder 999,999");
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
            confirmButtonColor: "#1B5E20",
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
        <>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header Mejorado */}
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl shadow-sm">
                            <Award className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Membresías Activas</h2>
                            <p className="text-sm text-gray-500 font-medium mt-0.5">
                                Vista de solo lectura · Actualización manual de nivel/puntos
                            </p>
                        </div>
                    </div>
                </div>

                {/* Info Card Modernizado */}
                <div className="mx-6 mt-6 p-4 bg-blue-50/80 backdrop-blur-sm border border-blue-100/50 rounded-xl flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 leading-relaxed">
                        <strong>Nota:</strong> Las membresías se crean automáticamente cuando un socio se activa.
                        Aquí solo puedes ajustar el nivel o los puntos manualmente en caso de ser necesario (admin override).
                    </p>
                </div>

                {/* Controles: Selector de Club y Buscador */}
                <div className="px-6 py-5 flex flex-col sm:flex-row items-end gap-4 border-b border-gray-100">
                    <div className="w-full sm:max-w-xs">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                            Club de Herbalife
                        </label>
                        <Listbox value={selectedClubId} onChange={setSelectedClubId}>
                            <div className="relative w-full">
                                <Listbox.Button className="relative w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-left focus:ring-2 focus:ring-herbalife-green/50 focus:border-herbalife-green outline-none cursor-pointer hover:bg-white hover:border-gray-300 transition-all shadow-sm">
                                    <span className="block truncate text-gray-800 font-semibold text-sm">
                                        {selectedClubId
                                            ? (() => {
                                                const club = clubes.find(c => c.id === selectedClubId);
                                                return club ? club.nombreClub : "Seleccionar club";
                                            })()
                                            : "Seleccionar club"
                                        }
                                    </span>
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </span>
                                </Listbox.Button>

                                <Listbox.Options className="absolute z-10 mt-1.5 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-auto focus:outline-none ring-1 ring-black ring-opacity-5">
                                    <Listbox.Option
                                        value={null}
                                        className={({ active }) =>
                                            `cursor-pointer select-none relative py-2.5 pl-10 pr-4 text-sm transition-colors ${active ? 'bg-herbalife-green/10 text-herbalife-dark' : 'text-gray-700'
                                            }`
                                        }
                                    >
                                        {({ selected }) => (
                                            <>
                                                <span className={`block truncate ${selected ? 'font-bold' : 'font-medium'}`}>
                                                    -- Todos los clubes --
                                                </span>
                                                {selected && (
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-herbalife-green">
                                                        <Check className="w-4 h-4" />
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
                                                `cursor-pointer select-none relative py-2.5 pl-10 pr-4 text-sm transition-colors ${active ? 'bg-herbalife-green/10 text-herbalife-dark' : 'text-gray-700'
                                                }`
                                            }
                                        >
                                            {({ selected }) => (
                                                <>
                                                    <span className={`block truncate ${selected ? 'font-bold' : 'font-medium'}`}>
                                                        {club.nombreClub}
                                                    </span>
                                                    {selected && (
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-herbalife-green">
                                                            <Check className="w-4 h-4" />
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

                    {selectedClubId && (
                        <div className="w-full sm:max-w-xs relative group">
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                                Buscar
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-herbalife-green transition-colors" />
                                <input
                                    type="search"
                                    placeholder="Nombre o nivel..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-herbalife-green/30 focus:border-herbalife-green focus:bg-white transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Contenido condicional */}
                {!selectedClubId ? (
                    <div className="py-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                            <Award className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">Ningún club seleccionado</h3>
                        <p className="text-sm text-gray-500">
                            Elige un club de la lista superior para visualizar sus membresías.
                        </p>
                    </div>
                ) : loading ? (
                    <div className="py-16 text-center">
                        <div className="animate-spin h-10 w-10 border-4 border-herbalife-green/30 border-t-herbalife-green rounded-full mx-auto shadow-sm"></div>
                        <p className="text-sm font-medium text-gray-500 mt-4">Cargando membresías...</p>
                    </div>
                ) : filteredMembresias.length === 0 ? (
                    <div className="py-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-inner">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">Sin resultados</h3>
                        <p className="text-sm text-gray-500">
                            {searchTerm ? "No se encontraron membresías que coincidan con la búsqueda." : "Este club aún no tiene membresías registradas."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-4">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-y border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Club</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Nivel</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Puntos</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredMembresias.map((membresia) => (
                                    <tr key={membresia.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-herbalife-green/20 to-herbalife-light/20 flex items-center justify-center flex-shrink-0 shadow-sm border border-herbalife-green/10">
                                                    <span className="text-sm font-bold text-herbalife-dark">
                                                        {membresia.usuarioNombre?.charAt(0) || <User className="w-5 h-5 text-gray-400" />}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {membresia.usuarioNombre || "Sin nombre"}
                                                    </span>
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        ID: {membresia.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                                                {membresia.clubNombre || "-"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-indigo-50 border border-purple-200 text-purple-700 rounded-full text-xs font-bold shadow-sm inline-block">
                                                {membresia.nivelNombre || "Básico"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp className="w-4 h-4 text-yellow-500" />
                                                <span className="text-sm font-bold text-gray-800">
                                                    {membresia.puntosAcumulados || 0}
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">pts</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setArbolMembresiaId(membresia.id);
                                                        setArbolNombreSocio(membresia.usuarioNombre || `Socio #${membresia.id}`);
                                                    }}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all hover:scale-105 active:scale-95"
                                                    title="Ver red de referidos"
                                                >
                                                    <Network className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleActualizarPuntos(membresia.id, membresia.puntos)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-all hover:scale-105 active:scale-95"
                                                    title="Actualizar puntos"
                                                >
                                                    <Award className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleActualizarNivel(membresia.id, membresia.nivelSocio?.id)}
                                                    className="p-2 text-purple-600 hover:bg-purple-50 hover:text-purple-700 rounded-xl transition-all hover:scale-105 active:scale-95"
                                                    title="Cambiar nivel"
                                                >
                                                    <Edit className="w-5 h-5" />
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

            {/* Modal Árbol de Referidos */}
            {
                arbolMembresiaId && (
                    <ArbolReferidosModal
                        membresiaId={arbolMembresiaId}
                        nombreSocio={arbolNombreSocio}
                        onClose={() => setArbolMembresiaId(null)}
                    />
                )
            }
        </>
    );
}
