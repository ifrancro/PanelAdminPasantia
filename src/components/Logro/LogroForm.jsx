import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getLogroById, createLogro, updateLogro } from "../../services/LogroService";

const TIPO_METRICA_OPTIONS = ["CONSUMO", "ASISTENCIA", "REFERIDOS"];

export default function LogroForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        iconoUrl: "",
        tipoRequisito: "",      // Integer: cantidad de asistencias requeridas
        tipoMetrica: "",        // CONSUMO | ASISTENCIA | REFERIDOS
        metaCantidad: "",       // Integer
        puntosRecompensa: "",   // Integer
        fechaInicio: "",        // YYYY-MM-DD (obligatorio)
        fechaFin: "",           // YYYY-MM-DD (obligatorio)
    });
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit) fetchLogro();
    }, [id]);

    const fetchLogro = async () => {
        try {
            const response = await getLogroById(id);
            const d = response.data;
            setFormData({
                nombre: d.nombre || "",
                descripcion: d.descripcion || "",
                iconoUrl: d.iconoUrl || "",
                tipoRequisito: d.tipoRequisito ?? "",
                tipoMetrica: d.tipoMetrica || "",
                metaCantidad: d.metaCantidad ?? "",
                puntosRecompensa: d.puntosRecompensa ?? "",
                fechaInicio: d.fechaInicio || "",
                fechaFin: d.fechaFin || "",
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
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const errs = {};

        if (!formData.nombre.trim()) {
            errs.nombre = "El nombre es requerido";
        } else if (formData.nombre.trim().length < 3) {
            errs.nombre = "Mínimo 3 caracteres";
        } else if (formData.nombre.trim().length > 100) {
            errs.nombre = "Máximo 100 caracteres";
        }

        if (!formData.fechaInicio) {
            errs.fechaInicio = "La fecha de inicio es obligatoria";
        }
        if (!formData.fechaFin) {
            errs.fechaFin = "La fecha de fin es obligatoria";
        }
        if (formData.fechaInicio && formData.fechaFin && formData.fechaFin < formData.fechaInicio) {
            errs.fechaFin = "La fecha de fin no puede ser anterior a la de inicio";
        }

        if (formData.tipoRequisito !== "" && (isNaN(Number(formData.tipoRequisito)) || Number(formData.tipoRequisito) < 0)) {
            errs.tipoRequisito = "Debe ser un número entero positivo";
        }
        if (formData.metaCantidad !== "" && (isNaN(Number(formData.metaCantidad)) || Number(formData.metaCantidad) < 0)) {
            errs.metaCantidad = "Debe ser un número entero positivo";
        }
        if (formData.puntosRecompensa !== "" && (isNaN(Number(formData.puntosRecompensa)) || Number(formData.puntosRecompensa) < 0)) {
            errs.puntosRecompensa = "Debe ser un número entero positivo";
        }
        if (formData.iconoUrl && formData.iconoUrl.trim()) {
            const urlRegex = /^https?:\/\/.+\..+/;
            if (!urlRegex.test(formData.iconoUrl.trim())) {
                errs.iconoUrl = "URL inválida (debe comenzar con http:// o https://)";
            }
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim() || null,
                iconoUrl: formData.iconoUrl.trim() || null,
                tipoRequisito: formData.tipoRequisito !== "" ? Number(formData.tipoRequisito) : null,
                tipoMetrica: formData.tipoMetrica || null,
                metaCantidad: formData.metaCantidad !== "" ? Number(formData.metaCantidad) : null,
                puntosRecompensa: formData.puntosRecompensa !== "" ? Number(formData.puntosRecompensa) : null,
                fechaInicio: formData.fechaInicio,
                fechaFin: formData.fechaFin,
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
            Swal.fire("Error", error.response?.data?.message || "No se pudo guardar el logro", "error");
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

    const inputClass = (field) =>
        `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none ${errors[field] ? "border-red-500" : "border-gray-300"}`;

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
                        <p className="text-sm text-gray-500">Logro / Achievement</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange}
                        placeholder="Ej: Primera Visita, Cliente Frecuente"
                        className={inputClass("nombre")} />
                    {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}
                        rows="3" placeholder="Describe el logro..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none resize-none" />
                </div>

                {/* URL Ícono */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL del Ícono</label>
                    <input type="text" name="iconoUrl" value={formData.iconoUrl} onChange={handleChange}
                        placeholder="https://ejemplo.com/icono.png"
                        className={inputClass("iconoUrl")} />
                    {errors.iconoUrl && <p className="text-red-500 text-sm mt-1">{errors.iconoUrl}</p>}
                </div>

                {/* Fechas de vigencia */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio *</label>
                        <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange}
                            className={inputClass("fechaInicio")} />
                        {errors.fechaInicio && <p className="text-red-500 text-sm mt-1">{errors.fechaInicio}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin *</label>
                        <input type="date" name="fechaFin" value={formData.fechaFin} onChange={handleChange}
                            min={formData.fechaInicio || undefined}
                            className={inputClass("fechaFin")} />
                        {errors.fechaFin && <p className="text-red-500 text-sm mt-1">{errors.fechaFin}</p>}
                    </div>
                </div>

                {/* Tipo Métrica */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo Métrica</label>
                    <select name="tipoMetrica" value={formData.tipoMetrica} onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none bg-white">
                        <option value="">-- Seleccionar --</option>
                        {TIPO_METRICA_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>

                {/* Tipo Requisito (número de asistencias) + Meta Cantidad */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo Requisito
                            <span className="ml-1 text-xs text-gray-400">(N° asistencias)</span>
                        </label>
                        <input type="number" name="tipoRequisito" value={formData.tipoRequisito} onChange={handleChange}
                            min="0" placeholder="Ej: 5"
                            className={inputClass("tipoRequisito")} />
                        {errors.tipoRequisito && <p className="text-red-500 text-sm mt-1">{errors.tipoRequisito}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta Cantidad</label>
                        <input type="number" name="metaCantidad" value={formData.metaCantidad} onChange={handleChange}
                            min="0" placeholder="Ej: 10"
                            className={inputClass("metaCantidad")} />
                        {errors.metaCantidad && <p className="text-red-500 text-sm mt-1">{errors.metaCantidad}</p>}
                    </div>
                </div>

                {/* Puntos Recompensa */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Puntos de Recompensa</label>
                    <input type="number" name="puntosRecompensa" value={formData.puntosRecompensa} onChange={handleChange}
                        min="0" placeholder="Ej: 100"
                        className={inputClass("puntosRecompensa")} />
                    {errors.puntosRecompensa && <p className="text-red-500 text-sm mt-1">{errors.puntosRecompensa}</p>}
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => navigate("/logros")}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="submit" disabled={loading}
                        className="flex items-center gap-2 px-6 py-3 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark disabled:opacity-50">
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
