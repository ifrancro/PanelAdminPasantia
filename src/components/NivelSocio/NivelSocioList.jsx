import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import Swal from "sweetalert2";
import { getAllNivelesSocio, deleteNivelSocio } from "../../services/NivelSocioService";

export default function NivelSocioList() {
    const [niveles, setNiveles] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNiveles();
    }, []);

    const fetchNiveles = async () => {
        try {
            setLoading(true);
            const response = await getAllNivelesSocio();
            setNiveles(response.data);
        } catch (error) {
            console.error("Error al cargar niveles:", error);
            Swal.fire("Error", "No se pudieron cargar los niveles", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Eliminar nivel?",
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
                await deleteNivelSocio(id);
                Swal.fire("Eliminado", "El nivel ha sido eliminado", "success");
                fetchNiveles();
            } catch (error) {
                Swal.fire("Error", "No se pudo eliminar el nivel", "error");
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

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <Layers className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Niveles de Socio</h2>
                        <p className="text-sm text-gray-500">{niveles.length} registros</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/niveles-socio/create")}
                    className="flex items-center gap-2 px-4 py-2 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Nivel
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visitas Requeridas</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficios</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {niveles.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No hay niveles registrados
                                </td>
                            </tr>
                        ) : (
                            niveles.map((nivel) => (
                                <tr key={nivel.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">{nivel.id}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                            {nivel.nombre}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{nivel.visitasRequeridas || "-"}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                        {nivel.descripcionBeneficios || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/niveles-socio/edit/${nivel.id}`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(nivel.id, nivel.nombre)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
