import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getNivelSocioById, createNivelSocio, updateNivelSocio } from "../../services/NivelSocioService";

export default function NivelSocioForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: "",
        visitasRequeridas: "",
        descripcionBeneficios: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [errors, setErrors] = useState({
        nombre: "",
        visitasRequeridas: "",
        descripcionBeneficios: "",
    });

    useEffect(() => {
        if (isEdit) fetchNivel();
    }, [id]);

    const fetchNivel = async () => {
        try {
            const response = await getNivelSocioById(id);
            setFormData({
                nombre: response.data.nombre || "",
                visitasRequeridas: response.data.visitasRequeridas || "",
                descripcionBeneficios: response.data.descripcionBeneficios || "",
            });
        } catch (error) {
            Swal.fire("Error", "No se pudo cargar el nivel", "error");
            navigate("/niveles-socio");
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Limpiar error al escribir
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    // Función de validación
    const validateForm = () => {
        let valid = true;
        const errorsCopy = { ...errors };

        // Nombre - requerido, min 3, max 50
        if (!formData.nombre.trim()) {
            errorsCopy.nombre = "El nombre es requerido";
            valid = false;
        } else if (formData.nombre.trim().length < 3) {
            errorsCopy.nombre = "El nombre debe tener al menos 3 caracteres";
            valid = false;
        } else if (formData.nombre.trim().length > 50) {
            errorsCopy.nombre = "El nombre no puede exceder 50 caracteres";
            valid = false;
        } else {
            errorsCopy.nombre = "";
        }

        // VisitasRequeridas - opcional, si se ingresa validar rango 0-1000
        if (formData.visitasRequeridas !== "" && formData.visitasRequeridas !== null) {
            const visitas = parseInt(formData.visitasRequeridas);

            if (isNaN(visitas) || visitas < 0) {
                errorsCopy.visitasRequeridas = "Las visitas deben ser un número positivo (0 o mayor)";
                valid = false;
            } else if (visitas > 1000) {
                errorsCopy.visitasRequeridas = "Las visitas no pueden exceder 1000";
                valid = false;
            } else {
                errorsCopy.visitasRequeridas = "";
            }
        } else {
            errorsCopy.visitasRequeridas = "";
        }

        // DescripcionBeneficios - max 500 caracteres
        if (formData.descripcionBeneficios.length > 500) {
            errorsCopy.descripcionBeneficios = "La descripción no puede exceder 500 caracteres";
            valid = false;
        } else {
            errorsCopy.descripcionBeneficios = "";
        }

        setErrors(errorsCopy);
        return valid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar formulario
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                visitasRequeridas: formData.visitasRequeridas ? parseInt(formData.visitasRequeridas) : null,
            };

            if (isEdit) {
                await updateNivelSocio(id, payload);
                Swal.fire("Actualizado", "Nivel actualizado correctamente", "success");
            } else {
                await createNivelSocio(payload);
                Swal.fire("Creado", "Nivel creado correctamente", "success");
            }
            navigate("/niveles-socio");
        } catch (error) {
            Swal.fire("Error", "No se pudo guardar el nivel", "error");
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
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/niveles-socio")} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? "Editar Nivel" : "Nuevo Nivel"}
                        </h2>
                        <p className="text-sm text-gray-500">Nivel de socio</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Bronce, Plata, Oro"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.nombre && (
                        <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Visitas Requeridas</label>
                    <input
                        type="number"
                        name="visitasRequeridas"
                        value={formData.visitasRequeridas}
                        onChange={handleChange}
                        placeholder="Ej: 10"
                        min="0"
                        max="1000"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.visitasRequeridas ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.visitasRequeridas && (
                        <p className="text-red-500 text-sm mt-1">{errors.visitasRequeridas}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción de Beneficios</label>
                    <textarea
                        name="descripcionBeneficios"
                        value={formData.descripcionBeneficios}
                        onChange={handleChange}
                        rows="3"
                        maxLength="500"
                        placeholder="Describe los beneficios de este nivel..."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none resize-none ${errors.descripcionBeneficios ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.descripcionBeneficios && (
                        <p className="text-red-500 text-sm mt-1">{errors.descripcionBeneficios}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">{formData.descripcionBeneficios.length}/500 caracteres</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/niveles-socio")}
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
