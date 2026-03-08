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
        fechaInicio: "",
        fechaFin: "",
        tipoMetrica: "",
        metaCantidad: "",
        puntosRecompensa: "",
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [errors, setErrors] = useState({
        nombre: "",
        iconoUrl: "",
        tipoRequisito: "",
        fechaInicio: "",
        fechaFin: "",
        tipoMetrica: "",
        metaCantidad: "",
        puntosRecompensa: "",
    });

    useEffect(() => {
        if (isEdit) fetchLogro();
    }, [id]);

    const fetchLogro = async () => {
        try {
            const response = await getLogroById(id);
            // Formatear fechas de LocalDate a YYYY-MM-DD
            const formatDate = (date) => {
                if (!date) return "";
                if (typeof date === 'string') {
                    // Si viene en formato ISO (YYYY-MM-DDTHH:mm:ss) o YYYY-MM-DD, extraer solo la fecha
                    return date.split('T')[0];
                }
                // Si es un objeto Date, convertir a YYYY-MM-DD
                if (date instanceof Date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
                return "";
            };

            setFormData({
                nombre: response.data.nombre || "",
                descripcion: response.data.descripcion || "",
                iconoUrl: response.data.iconoUrl || "",
                tipoRequisito: response.data.tipoRequisito !== null && response.data.tipoRequisito !== undefined ? response.data.tipoRequisito.toString() : "",
                fechaInicio: formatDate(response.data.fechaInicio) || "",
                fechaFin: formatDate(response.data.fechaFin) || "",
                tipoMetrica: response.data.tipoMetrica || "",
                metaCantidad: response.data.metaCantidad !== null && response.data.metaCantidad !== undefined ? response.data.metaCantidad.toString() : "",
                puntosRecompensa: response.data.puntosRecompensa !== null && response.data.puntosRecompensa !== undefined ? response.data.puntosRecompensa.toString() : "",
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

        // TipoRequisito - debe ser un número entero positivo (opcional)
        if (formData.tipoRequisito && formData.tipoRequisito.toString().trim()) {
            const tipoValue = formData.tipoRequisito.toString().trim();
            const numero = parseInt(tipoValue, 10);
            if (isNaN(numero) || numero <= 0 || !Number.isInteger(numero)) {
                errorsCopy.tipoRequisito = "Debe ser un número entero positivo (ej: 5, 10, 20)";
                valid = false;
            } else {
                errorsCopy.tipoRequisito = "";
            }
        } else {
            errorsCopy.tipoRequisito = "";
        }

        // FechaInicio - obligatorio y formato YYYY-MM-DD
        if (!formData.fechaInicio.trim()) {
            errorsCopy.fechaInicio = "La fecha de inicio es requerida";
            valid = false;
        } else {
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(formData.fechaInicio.trim())) {
                errorsCopy.fechaInicio = "Formato inválido. Use YYYY-MM-DD";
                valid = false;
            } else {
                const fechaInicio = new Date(formData.fechaInicio);
                if (isNaN(fechaInicio.getTime())) {
                    errorsCopy.fechaInicio = "Fecha inválida";
                    valid = false;
                } else {
                    errorsCopy.fechaInicio = "";
                }
            }
        }

        // FechaFin - obligatorio y formato YYYY-MM-DD
        if (!formData.fechaFin.trim()) {
            errorsCopy.fechaFin = "La fecha de fin es requerida";
            valid = false;
        } else {
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(formData.fechaFin.trim())) {
                errorsCopy.fechaFin = "Formato inválido. Use YYYY-MM-DD";
                valid = false;
            } else {
                const fechaFin = new Date(formData.fechaFin);
                if (isNaN(fechaFin.getTime())) {
                    errorsCopy.fechaFin = "Fecha inválida";
                    valid = false;
                } else {
                    errorsCopy.fechaFin = "";
                }
            }
        }

        // Validar que fechaInicio < fechaFin
        if (formData.fechaInicio.trim() && formData.fechaFin.trim()) {
            const fechaInicio = new Date(formData.fechaInicio);
            const fechaFin = new Date(formData.fechaFin);
            if (fechaInicio >= fechaFin) {
                errorsCopy.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio";
                valid = false;
            }
        }

        // TipoMetrica - debe ser uno de los valores permitidos (opcional)
        if (formData.tipoMetrica && formData.tipoMetrica.trim()) {
            const tiposPermitidos = ['CONSUMO', 'ASISTENCIA', 'REFERIDOS'];
            const tipoUpper = formData.tipoMetrica.trim().toUpperCase();
            if (!tiposPermitidos.includes(tipoUpper)) {
                errorsCopy.tipoMetrica = "Tipo inválido. Use: CONSUMO, ASISTENCIA o REFERIDOS";
                valid = false;
            } else {
                errorsCopy.tipoMetrica = "";
            }
        } else {
            errorsCopy.tipoMetrica = "";
        }

        // MetaCantidad - debe ser un número entero positivo (opcional)
        if (formData.metaCantidad && formData.metaCantidad.toString().trim()) {
            const metaValue = formData.metaCantidad.toString().trim();
            const numero = parseInt(metaValue, 10);
            if (isNaN(numero) || numero <= 0 || !Number.isInteger(numero)) {
                errorsCopy.metaCantidad = "Debe ser un número entero positivo (ej: 10)";
                valid = false;
            } else {
                errorsCopy.metaCantidad = "";
            }
        } else {
            errorsCopy.metaCantidad = "";
        }

        // PuntosRecompensa - debe ser un número entero positivo (opcional)
        if (formData.puntosRecompensa && formData.puntosRecompensa.toString().trim()) {
            const puntosValue = formData.puntosRecompensa.toString().trim();
            const numero = parseInt(puntosValue, 10);
            if (isNaN(numero) || numero <= 0 || !Number.isInteger(numero)) {
                errorsCopy.puntosRecompensa = "Debe ser un número entero positivo";
                valid = false;
            } else {
                errorsCopy.puntosRecompensa = "";
            }
        } else {
            errorsCopy.puntosRecompensa = "";
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
            // Preparar los datos para enviar, convirtiendo valores a los tipos correctos
            const payload = {
                ...formData,
                tipoRequisito: formData.tipoRequisito && formData.tipoRequisito.toString().trim() 
                    ? parseInt(formData.tipoRequisito.toString().trim(), 10) 
                    : null,
                fechaInicio: formData.fechaInicio.trim() || null,
                fechaFin: formData.fechaFin.trim() || null,
                tipoMetrica: formData.tipoMetrica.trim() || null,
                metaCantidad: formData.metaCantidad && formData.metaCantidad.toString().trim() 
                    ? parseInt(formData.metaCantidad.toString().trim(), 10) 
                    : null,
                puntosRecompensa: formData.puntosRecompensa && formData.puntosRecompensa.toString().trim() 
                    ? parseInt(formData.puntosRecompensa.toString().trim(), 10) 
                    : null,
            };

            if (isEdit) {
                await updateLogro(id, payload);
                Swal.fire("Actualizado", "Logro actualizado correctamente", "success");
            } else {
                await createLogro(payload);
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
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-4xl mx-auto">
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
                        type="number"
                        name="tipoRequisito"
                        value={formData.tipoRequisito}
                        onChange={handleChange}
                        placeholder="Ej: 5, 10, 20"
                        min="1"
                        step="1"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.tipoRequisito ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    <p className="text-gray-500 text-xs mt-1">
                        Ingresa la cantidad de asistencias requeridas para obtener el logro (solo el número)
                    </p>
                    {errors.tipoRequisito && (
                        <p className="text-red-500 text-sm mt-1">{errors.tipoRequisito}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio *</label>
                        <input
                            type="date"
                            name="fechaInicio"
                            value={formData.fechaInicio}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.fechaInicio ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.fechaInicio && (
                            <p className="text-red-500 text-sm mt-1">{errors.fechaInicio}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin *</label>
                        <input
                            type="date"
                            name="fechaFin"
                            value={formData.fechaFin}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.fechaFin ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.fechaFin && (
                            <p className="text-red-500 text-sm mt-1">{errors.fechaFin}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Métrica</label>
                    <select
                        name="tipoMetrica"
                        value={formData.tipoMetrica}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.tipoMetrica ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <option value="">Seleccione un tipo</option>
                        <option value="CONSUMO">CONSUMO</option>
                        <option value="ASISTENCIA">ASISTENCIA</option>
                        <option value="REFERIDOS">REFERIDOS</option>
                    </select>
                    {errors.tipoMetrica && (
                        <p className="text-red-500 text-sm mt-1">{errors.tipoMetrica}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Cantidad</label>
                        <input
                            type="number"
                            name="metaCantidad"
                            value={formData.metaCantidad}
                            onChange={handleChange}
                            placeholder="Ej: 10"
                            min="1"
                            step="1"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.metaCantidad ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.metaCantidad && (
                            <p className="text-red-500 text-sm mt-1">{errors.metaCantidad}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Puntos de Recompensa</label>
                        <input
                            type="number"
                            name="puntosRecompensa"
                            value={formData.puntosRecompensa}
                            onChange={handleChange}
                            placeholder="Ej: 100"
                            min="1"
                            step="1"
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.puntosRecompensa ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.puntosRecompensa && (
                            <p className="text-red-500 text-sm mt-1">{errors.puntosRecompensa}</p>
                        )}
                    </div>
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
