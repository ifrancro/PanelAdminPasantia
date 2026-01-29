import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Trophy } from "lucide-react";
import Swal from "sweetalert2";
import { getAllLogros, deleteLogro } from "../../services/LogroService";

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
            } catch (error) {
                Swal.fire("Error", "No se pudo eliminar el logro", "error");
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
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Logros</h2>
                        <p className="text-sm text-gray-500">{logros.length} registros</p>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo Requisito</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logros.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                    No hay logros registrados
                                </td>
                            </tr>
                        ) : (
                            logros.map((logro) => (
                                <tr key={logro.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-600">{logro.id}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                            {logro.nombre}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                        {logro.descripcion || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {logro.tipoRequisito || "-"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/logros/edit/${logro.id}`)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(logro.id, logro.nombre)}
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
