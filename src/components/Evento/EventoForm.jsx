/**
 * 📝 EventoForm.jsx
 * Formulario para crear/editar eventos corporativos
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getEventoById, createEvento, updateEvento } from "../../services/EventoService";

export default function EventoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        fecha: "",
        ubicacion: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [errors, setErrors] = useState({
        nombre: "",
        descripcion: "",
        fecha: "",
        ubicacion: "",
    });

    useEffect(() => {
        if (isEdit) fetchEvento();
    }, [id]);

    const fetchEvento = async () => {
        try {
            const response = await getEventoById(id);
            setFormData({
                nombre: response.data.nombre || "",
                descripcion: response.data.descripcion || "",
                fecha: response.data.fecha ? response.data.fecha.split('T')[0] : "",
                ubicacion: response.data.ubicacion || "",
            });
        } catch (error) {
            Swal.fire("Error", "No se pudo cargar el evento", "error");
            navigate("/eventos");
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

        // Nombre - requerido, min 3, max 100
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

        // Descripción - max 500 caracteres
        if (formData.descripcion.length > 500) {
            errorsCopy.descripcion = "La descripción no puede exceder 500 caracteres";
            valid = false;
        } else {
            errorsCopy.descripcion = "";
        }

        // Fecha - validar fecha futura
        if (formData.fecha) {
            const fechaSeleccionada = new Date(formData.fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

            if (fechaSeleccionada < hoy) {
                errorsCopy.fecha = "La fecha del evento debe ser futura";
                valid = false;
            } else {
                errorsCopy.fecha = "";
            }
        } else {
            errorsCopy.fecha = "";
        }

        // Ubicación - max 200 caracteres
        if (formData.ubicacion.length > 200) {
            errorsCopy.ubicacion = "La ubicación no puede exceder 200 caracteres";
            valid = false;
        } else {
            errorsCopy.ubicacion = "";
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
                await updateEvento(id, formData);
                Swal.fire("Actualizado", "Evento actualizado", "success");
            } else {
                await createEvento(formData);
                Swal.fire("Creado", "Evento creado correctamente", "success");
            }
            navigate("/eventos");
        } catch (error) {
            Swal.fire("Error", "No se pudo guardar", "error");
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
                    <button onClick={() => navigate("/eventos")} className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? "Editar Evento" : "Nuevo Evento"}
                        </h2>
                        <p className="text-sm text-gray-500">Evento corporativo</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Evento *</label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Conferencia Anual 2026"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
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
                        rows="4"
                        maxLength="500"
                        placeholder="Descripción del evento..."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none resize-none ${errors.descripcion ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.descripcion && (
                        <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">{formData.descripcion.length}/500 caracteres</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                        <input
                            type="date"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none ${errors.fecha ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.fecha && (
                            <p className="text-red-500 text-sm mt-1">{errors.fecha}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación</label>
                        <input
                            type="text"
                            name="ubicacion"
                            value={formData.ubicacion}
                            onChange={handleChange}
                            maxLength="200"
                            placeholder="Lugar del evento"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none ${errors.ubicacion ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.ubicacion && (
                            <p className="text-red-500 text-sm mt-1">{errors.ubicacion}</p>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/eventos")}
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
