/**
 * 📝 ProductoForm.jsx
 * Formulario para crear/editar productos del catálogo
 * 
 * ⚠️ HubId hardcodeado temporalmente a 1
 * TODO: Cuando se implemente gestión de hubs, cambiar en línea 26
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Swal from "sweetalert2";
import { getProductoById, createProducto, updateProducto } from "../../services/ProductoService";

export default function ProductoForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        puntosValor: "",
        ingredientes: "",
    });

    // ⚠️ HARDCODED: Hub ID = 1
    const hubId = 1;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [errors, setErrors] = useState({
        nombre: "",
        descripcion: "",
        puntosValor: "",
    });

    useEffect(() => {
        // Removido fetchHubs - ya no se necesita
        if (isEdit) fetchProducto();
    }, [id]);

    const fetchProducto = async () => {
        try {
            const response = await getProductoById(id);
            setFormData({
                nombre: response.data.nombre || "",
                descripcion: response.data.descripcion || "",
                puntosValor: response.data.puntosValor ?? "",
                ingredientes: response.data.ingredientes || "",
            });
        } catch (error) {
            Swal.fire("Error", "No se pudo cargar el producto", "error");
            navigate("/productos");
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

        // Puntos Valor - debe ser número entero positivo si se ingresa
        if (formData.puntosValor !== "" && (isNaN(Number(formData.puntosValor)) || Number(formData.puntosValor) < 0)) {
            errorsCopy.puntosValor = "Debe ser un número entero positivo";
            valid = false;
        } else {
            errorsCopy.puntosValor = "";
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

        // Validación removida - hubId siempre es 1

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre.trim(),
                descripcion: formData.descripcion.trim() || null,
                puntosValor: formData.puntosValor !== "" ? Number(formData.puntosValor) : null,
                ingredientes: formData.ingredientes.trim() || null,
            };

            if (isEdit) {
                await updateProducto(id, payload);
                Swal.fire("Actualizado", "Producto actualizado", "success");
            } else {
                await createProducto(payload, hubId);
                Swal.fire("Creado", "Producto creado en el Hub", "success");
            }
            navigate("/productos");
        } catch (error) {
            console.error("Error:", error);
            Swal.fire("Error", error.response?.data?.message || "No se pudo guardar", "error");
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
                        onClick={() => navigate("/productos")}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {isEdit ? "Editar Producto" : "Nuevo Producto"}
                        </h2>
                        <p className="text-sm text-gray-500">Catálogo global</p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Producto *
                    </label>
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Batido Nutricional, Té Herbal"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.nombre && (
                        <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>
                    )}
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
                        maxLength="500"
                        placeholder="Descripción del producto..."
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none resize-none ${errors.descripcion ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.descripcion && (
                        <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">{formData.descripcion.length}/500 caracteres</p>
                </div>

                {/* Puntos Valor */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puntos Valor
                    </label>
                    <input
                        type="number"
                        name="puntosValor"
                        value={formData.puntosValor}
                        onChange={handleChange}
                        min="0"
                        placeholder="Ej: 50"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.puntosValor ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.puntosValor && (
                        <p className="text-red-500 text-sm mt-1">{errors.puntosValor}</p>
                    )}
                </div>

                {/* Ingredientes (privado) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ingredientes
                        <span className="ml-2 text-xs text-gray-400">(privado, visible solo admin/anfitrión)</span>
                    </label>
                    <textarea
                        name="ingredientes"
                        value={formData.ingredientes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Lista de ingredientes..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none resize-none"
                    />
                </div>

                {/* Hub selector removido - hubId hardcodeado a 1 */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        🛈 <strong>Nota:</strong> Los productos se crean automáticamente en el Hub ID=1.
                        {/* TODO: Agregar selector de Hub cuando se implemente gestión de hubs */}
                    </p>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/productos")}
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
