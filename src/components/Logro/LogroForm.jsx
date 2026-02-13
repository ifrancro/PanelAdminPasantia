import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getLogroById, createLogro, updateLogro } from "../../services/LogroService";

export default function LogroForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        iconoUrl: "",
        tipoRequisito: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [errors, setErrors] = useState({
        nombre: "",
        iconoUrl: "",
        tipoRequisito: "",
    });

    useEffect(() => {
        if (isEdit) fetchLogro();
    }, [id]);

    const fetchLogro = async () => {
        try {
            const response = await getLogroById(id);
            setFormData({
                nombre: response.data.nombre || "",
                descripcion: response.data.descripcion || "",
                iconoUrl: response.data.iconoUrl || "",
                tipoRequisito: response.data.tipoRequisito || "",
            });
        } catch (error) {
            Swal.fire("Error", "No se pudo cargar el logro", "error");
            navigate("/logros");
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

        // Nombre - requerido y longitud mínima 3, máxima 100
        if (!formData.nombre.trim()) {
            errorsCopy.nombre = "El nombre es requerido";
            valid = false;
        } else if (formData.nombre.trim().length < 3) {
            errorsCopy.nombre = "El nombre debe tener al menos 3 caracteres";
            valid = false;
        } else if (formData.nombre.trim().length > 100) {
            errorsCopy.nombre = "El nombre no puede exceder 100 caracteres";
            valid = false;
        } else {
            errorsCopy.nombre = "";
        }

        // IconoUrl - formato URL válido (opcional pero si se ingresa, validar)
        if (formData.iconoUrl && formData.iconoUrl.trim()) {
            const urlRegex = /^https?:\/\/.+\..+/;
            if (!urlRegex.test(formData.iconoUrl.trim())) {
                errorsCopy.iconoUrl = "La URL del ícono debe ser válida (http:// o https://)";
                valid = false;
            } else {
                errorsCopy.iconoUrl = "";
            }
        } else {
            errorsCopy.iconoUrl = "";
        }

        // TipoRequisito - solo valores permitidos (opcional)
        if (formData.tipoRequisito && formData.tipoRequisito.trim()) {
            const tiposPermitidos = ['VISITAS', 'CONSUMO', 'REFERIDOS'];
            const tipoUpper = formData.tipoRequisito.trim().toUpperCase();
            if (!tiposPermitidos.includes(tipoUpper)) {
                errorsCopy.tipoRequisito = "Tipo inválido. Usa: VISITAS, CONSUMO o REFERIDOS";
                valid = false;
            } else {
                errorsCopy.tipoRequisito = "";
            }
        } else {
            errorsCopy.tipoRequisito = "";
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
            if (isEdit) {
                await updateLogro(id, formData);
                Swal.fire("Actualizado", "Logro actualizado correctamente", "success");
            } else {
                await createLogro(formData);
                Swal.fire("Creado", "Logro creado correctamente", "success");
            }
            navigate("/logros");
        } catch (error) {
            Swal.fire("Error", "No se pudo guardar el logro", "error");
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
                    <button onClick={() => navigate("/logros")} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? "Editar Logro" : "Nuevo Logro"}
                        </h2>
                        <p className="text-sm text-gray-500">Logro/Achievement</p>
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
                        placeholder="Ej: Primera Visita, Cliente Frecuente"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.nombre && (
                        <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Describe el logro..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none resize-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL del Ícono</label>
                    <input
                        type="text"
                        name="iconoUrl"
                        value={formData.iconoUrl}
                        onChange={handleChange}
                        placeholder="https://ejemplo.com/icono.png"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.iconoUrl ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.iconoUrl && (
                        <p className="text-red-500 text-sm mt-1">{errors.iconoUrl}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Requisito</label>
                    <input
                        type="text"
                        name="tipoRequisito"
                        value={formData.tipoRequisito}
                        onChange={handleChange}
                        placeholder="Ej: VISITAS, CONSUMO, REFERIDOS"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.tipoRequisito ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.tipoRequisito && (
                        <p className="text-red-500 text-sm mt-1">{errors.tipoRequisito}</p>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/logros")}
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
