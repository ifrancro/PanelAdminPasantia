/**
 * 📝 HubForm.jsx
 * Formulario para crear/editar hubs
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getHubById, createHub, updateHub } from "../../services/HubService";
import { useAuth } from "../../context/AuthContext";

export default function HubForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // Para obtener el adminId
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        ciudad: "",
        direccion: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);

    useEffect(() => {
        if (isEdit) fetchHub();
    }, [id]);

    const fetchHub = async () => {
        try {
            const response = await getHubById(id);
            setFormData({
                nombre: response.data.nombre || "",
                descripcion: response.data.descripcion || "",
                ciudad: response.data.ciudad || "",
                direccion: response.data.direccion || "",
            });
        } catch (error) {
            Swal.fire("Error", "No se pudo cargar el hub", "error");
            navigate("/hubs");
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            Swal.fire("Validación", "El nombre es requerido", "warning");
            return;
        }

        setLoading(true);
        try {
            if (isEdit) {
                await updateHub(id, formData);
                Swal.fire("Actualizado", "Hub actualizado", "success");
            } else {
                // Usamos el ID del usuario autenticado como adminId
                await createHub(formData, user?.id || 1);
                Swal.fire("Creado", "Hub creado correctamente", "success");
            }
            navigate("/hubs");
        } catch (error) {
            console.error("Error:", error);
            Swal.fire("Error", "No se pudo guardar el hub", "error");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate("/hubs")}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? "Editar Hub" : "Nuevo Hub"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isEdit ? "Modifica los datos del hub" : "Crea un nuevo hub/zona"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Hub *
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Hub Norte, Hub Centro"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                    </label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Descripción del hub (opcional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ciudad
                    </label>
                    <input
                        type="text"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleChange}
                        placeholder="Ej: Cochabamba, Santa Cruz"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                    </label>
                    <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        placeholder="Dirección principal del hub"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none"
                    />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/hubs")}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isEdit ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
