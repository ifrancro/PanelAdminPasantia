/**
 * 📅 EventoList.jsx
 * Lista de eventos corporativos con CRUD
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { getAllEventos, deleteEvento } from "../../services/EventoService";

export default function EventoList() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventos();
    }, []);

    const fetchEventos = async () => {
        try {
            setLoading(true);
            const response = await getAllEventos();
            setEventos(response.data);
        } catch (error) {
            console.error("Error al cargar eventos:", error);
            Swal.fire("Error", "No se pudieron cargar los eventos", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Eliminar evento?",
            text: `"${nombre}" será eliminado`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Sí, eliminar",
        });

        if (result.isConfirmed) {
            try {
                await deleteEvento(id);
                Swal.fire("Eliminado", "Evento eliminado", "success");
                fetchEventos();
            } catch (error) {
                Swal.fire("Error", "No se pudo eliminar", "error");
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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Eventos Corporativos</h2>
                        <p className="text-sm text-gray-500">{eventos.length} eventos</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/eventos/create")}
                    className="flex items-center gap-2 px-4 py-2 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Evento
                </button>
            </div>

            {/* Grid de eventos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventos.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl p-8 text-center shadow-md">
                        <p className="text-gray-500">No hay eventos registrados</p>
                    </div>
                ) : (
                    eventos.map((evento) => (
                        <div key={evento.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {evento.nombre}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {evento.descripcion || "Sin descripción"}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        {evento.fechaEvento
                                            ? new Date(evento.fechaEvento + "T00:00:00").toLocaleDateString("es-BO", { year: "numeric", month: "long", day: "numeric" })
                                            : "Fecha no especificada"}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <button
                                        onClick={() => navigate(`/eventos/edit/${evento.id}`)}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                        title="Editar"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(evento.id, evento.nombre)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
