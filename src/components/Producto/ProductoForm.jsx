/**
 * 📝 ProductoForm.jsx
 * Formulario para crear/editar productos del catálogo
 * 
 * ⚠️ HubId hardcodeado temporalmente a 2
 * TODO: Cuando se implemente gestión de hubs, cambiar en línea 24
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
    });

    // ⚠️ HARDCODED: Hub ID = 2 (coincide con el Hub existente en BD)
    // TODO: Cuando se implemente gestión de hubs, reemplazar por selector dinámico
    const hubId = 2;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);

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
            });
            // hubId ya está hardcodeado a 1, no se carga del producto
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre.trim()) {
            Swal.fire("Validación", "El nombre es requerido", "warning");
            return;
        }

        // Validación removida - hubId siempre es 1

        setLoading(true);
        try {
            const payload = {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
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
                        placeholder="Descripción del producto..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none resize-none"
                    />
                </div>

                {/* Hub selector removido - hubId hardcodeado a 2 */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        🛈 <strong>Nota:</strong> Los productos se crean automáticamente en el Hub ID=2.
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
