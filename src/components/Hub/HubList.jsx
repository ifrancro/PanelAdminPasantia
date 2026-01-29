/**
 * 📋 HubList.jsx
 * Lista de hubs con acciones CRUD
 * Los hubs son las regiones/zonas que agrupan clubes
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Building2, Power, PowerOff } from "lucide-react";
import Swal from "sweetalert2";
import { getAllHubs, deleteHub, activarHub, inactivarHub } from "../../services/HubService";

export default function HubList() {
    const [hubs, setHubs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHubs();
    }, []);

    const fetchHubs = async () => {
        try {
            setLoading(true);
            const response = await getAllHubs();
            setHubs(response.data);
        } catch (error) {
            console.error("Error al cargar hubs:", error);
            Swal.fire("Error", "No se pudieron cargar los hubs", "error");
        } finally {
            setLoading(false);
        }
    };

    // === ACCIONES ===
    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Eliminar hub?",
            text: `¿Estás seguro de eliminar "${nombre}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Sí, eliminar",
        });
        if (result.isConfirmed) {
            try {
                await deleteHub(id);
                Swal.fire("Eliminado", "Hub eliminado", "success");
                fetchHubs();
            } catch (error) {
                Swal.fire("Error", "No se pudo eliminar", "error");
            }
        }
    };

    const handleActivar = async (id) => {
        await activarHub(id);
        Swal.fire("Activado", "Hub activado", "success");
        fetchHubs();
    };

    const handleInactivar = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Inactivar hub?",
            text: `¿Desactivar "${nombre}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, inactivar",
        });
        if (result.isConfirmed) {
            await inactivarHub(id);
            Swal.fire("Inactivado", "Hub inactivado", "info");
            fetchHubs();
        }
    };

    const getEstadoBadge = (estado) => {
        return estado === "ACTIVO"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700";
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
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Hubs</h2>
                        <p className="text-sm text-gray-500">{hubs.length} hubs registrados</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/hubs/create")}
                    className="flex items-center gap-2 px-4 py-2 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Hub
                </button>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ciudad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {hubs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No hay hubs registrados
                                </td>
                            </tr>
                        ) : (
                            hubs.map((hub) => (
                                <tr key={hub.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">{hub.id}</td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{hub.nombre}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{hub.ciudad || "-"}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(hub.estado)}`}>
                                            {hub.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/hubs/edit/${hub.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {hub.estado === "ACTIVO" ? (
                                                <button
                                                    onClick={() => handleInactivar(hub.id, hub.nombre)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                    title="Inactivar"
                                                >
                                                    <PowerOff className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivar(hub.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Activar"
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(hub.id, hub.nombre)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
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
