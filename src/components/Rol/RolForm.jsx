import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getRolById, createRol, updateRol } from "../../services/RolService";

/**
 * 📝 RolForm
 * Formulario para crear/editar roles
 */
export default function RolForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);

    useEffect(() => {
        if (isEdit) {
            fetchRol();
        }
    }, [id]);

    const fetchRol = async () => {
        try {
            const response = await getRolById(id);
            setFormData({
                nombre: response.data.nombre || "",
            });
        } catch (error) {
            console.error("Error al cargar rol:", error);
            Swal.fire("Error", "No se pudo cargar el rol", "error");
            navigate("/roles");
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
                await updateRol(id, formData);
                Swal.fire("Actualizado", "Rol actualizado correctamente", "success");
            } else {
                await createRol(formData);
                Swal.fire("Creado", "Rol creado correctamente", "success");
            }
            navigate("/roles");
        } catch (error) {
            console.error("Error al guardar:", error);
            Swal.fire("Error", "No se pudo guardar el rol", "error");
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
                        onClick={() => navigate("/roles")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? "Editar Rol" : "Nuevo Rol"}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isEdit ? "Modifica los datos del rol" : "Ingresa los datos del nuevo rol"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Rol *
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: ADMIN, SOCIO, ANFITRION"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none transition-all"
                    />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/roles")}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark transition-colors disabled:opacity-50"
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
