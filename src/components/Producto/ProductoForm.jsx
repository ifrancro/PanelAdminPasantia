/**
 * 📝 ProductoForm.jsx
 * Formulario para crear/editar productos del catálogo
 * 
 * ⚠️ HubId hardcodeado temporalmente a 1
 * TODO: Cuando se implemente gestión de hubs, cambiar en línea 26
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package } from "lucide-react";
import Swal from "sweetalert2";
import { getProductoById, createProducto, updateProducto, subirImagenProducto } from "../../services/ProductoService";
import { useAuth } from "../../context/AuthContext";

export default function ProductoForm() {
    const { user } = useAuth();
    const userRole = user?.rol?.nombre?.toUpperCase();

    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        puntosValor: "",
        ingredientes: "",
        esCombo: false,
        imagenUrl: "",
    });

    // ⚠️ HARDCODED: Hub ID = 1
    const hubId = 1;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEdit);
    const [errors, setErrors] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        puntosValor: "",
    });

    useEffect(() => {
        // Removido fetchHubs - ya no se necesita
        if (isEdit) fetchProducto();
    }, [id]);

    const fetchProducto = async () => {
        try {
            const response = await getProductoById(id);
            const data = response.data;
            setFormData({
                nombre: data.nombre || "",
                descripcion: data.descripcion || "",
                precio: data.precio ?? "",
                puntosValor: data.puntosValor ?? "",
                ingredientes: data.ingredientes || "",
                esCombo: data.esCombo ?? false,
                imagenUrl: data.imagenUrl || "",
            });
        } catch (error) {
            Swal.fire("Error", "No se pudo cargar el producto", "error");
            navigate("/productos");
        } finally {
            setLoadingData(false);
        }
    };

    const [uploadingImage, setUploadingImage] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Limpiar error al escribir
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const response = await subirImagenProducto(file);
            const uploadedUrl = response.data.imagenUrl;
            setFormData(prev => ({ ...prev, imagenUrl: uploadedUrl }));
            Swal.fire({
                icon: "success",
                title: "Imagen cargada",
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al subir imagen:", error);
            Swal.fire("Error", "No se pudo subir la imagen", "error");
        } finally {
            setUploadingImage(false);
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

        // Precio - debe ser número positivo o decimal si se ingresa
        if (formData.precio !== "" && (isNaN(Number(formData.precio)) || Number(formData.precio) < 0)) {
            errorsCopy.precio = "Debe ser un número positivo";
            valid = false;
        } else {
            errorsCopy.precio = "";
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
                precio: formData.precio !== "" ? Number(formData.precio) : null,
                puntosValor: formData.puntosValor !== "" ? Number(formData.puntosValor) : null,
                ingredientes: formData.ingredientes.trim() || null,
                esCombo: formData.esCombo,
                imagenUrl: formData.imagenUrl || null,
            };

            if (isEdit) {
                await updateProducto(id, payload);
                Swal.fire("Actualizado", "Producto actualizado", "success");
            } else {
                await createProducto(payload, hubId);
                Swal.fire(
                    "Creado",
                    userRole === "ANFITRION"
                        ? "Producto/combo enviado para aprobación del administrador"
                        : "Producto creado en el Hub",
                    "success"
                );
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
                            {isEdit ? "Editar Producto/Combo" : "Nuevo Producto/Combo"}
                        </h2>
                        <p className="text-sm text-gray-500">{userRole === "ANFITRION" ? "Menú local de mi Club" : "Catálogo global"}</p>
                    </div>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Imagen del Producto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagen del Producto
                    </label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative">
                            {formData.imagenUrl ? (
                                <img src={formData.imagenUrl} alt="Vista previa" className="w-full h-full object-cover" />
                            ) : (
                                <Package className="w-8 h-8 text-gray-400" />
                            )}
                            {uploadingImage && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload-input"
                                disabled={uploadingImage}
                            />
                            <label
                                htmlFor="image-upload-input"
                                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer inline-block"
                            >
                                {uploadingImage ? "Subiendo..." : "Subir Imagen"}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Soporta PNG, JPG. Máximo 5MB.</p>
                        </div>
                    </div>
                </div>

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

                {/* Precio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio ($)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        name="precio"
                        value={formData.precio}
                        onChange={handleChange}
                        min="0"
                        placeholder="Ej: 15.50"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none ${errors.precio ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.precio && (
                        <p className="text-red-500 text-sm mt-1">{errors.precio}</p>
                    )}
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

                {/* Switch de Combo */}
                <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div>
                        <label className="text-sm font-medium text-gray-700 font-semibold">¿Es un Combo?</label>
                        <p className="text-xs text-gray-500">Activa esta opción si este producto es un paquete o combo</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, esCombo: !prev.esCombo }))}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.esCombo ? 'bg-herbalife-green' : 'bg-gray-300'}`}
                    >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${formData.esCombo ? 'translate-x-5' : ''}`} />
                    </button>
                </div>

                {/* Hub selector removido - hubId hardcodeado a 1 */}
                {userRole === "ANFITRION" ? (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm text-purple-800">
                            🛈 <strong>Información:</strong> Este producto/combo se creará en tu club y estará en estado <strong>PENDIENTE</strong> de aprobación por parte del administrador antes de ser visible para los socios.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                            🛈 <strong>Nota:</strong> Los productos se crean automáticamente en el Hub ID=1.
                        </p>
                    </div>
                )}

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
