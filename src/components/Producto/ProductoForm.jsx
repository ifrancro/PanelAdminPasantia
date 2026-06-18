/**
 * 📝 ProductoForm.jsx
 * Formulario para crear/editar productos del catálogo
 * 
 * ⚠️ HubId hardcodeado temporalmente a 1
 * TODO: Cuando se implemente gestión de hubs, cambiar en línea 26
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Package, CloudUpload } from "lucide-react";
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl mx-auto p-8 mb-8">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate("/productos")}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                    {isEdit ? "Editar Producto/Combo" : "Nuevo Producto/Combo"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    {userRole === "ANFITRION" ? "Menú local de mi Club" : "Catálogo global"}
                </p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Zona de Carga de Imagen */}
                <div className="relative">
                    <div className={`w-full border-2 border-dashed ${uploadingImage ? 'border-herbalife-green bg-herbalife-green/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'} rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden min-h-[160px]`}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            disabled={uploadingImage}
                        />
                        {formData.imagenUrl ? (
                            <div className="absolute inset-0 w-full h-full p-2">
                                <img src={formData.imagenUrl} alt="Vista previa" className="w-full h-full object-contain bg-white rounded-lg" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                                    <p className="text-white font-medium flex items-center gap-2">
                                        <CloudUpload className="w-5 h-5" />
                                        Clic para cambiar imagen
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {uploadingImage ? (
                                    <div className="w-8 h-8 border-4 border-herbalife-green border-t-transparent rounded-full animate-spin mb-3"></div>
                                ) : (
                                    <CloudUpload className="w-10 h-10 text-gray-400 mb-3" />
                                )}
                                <p className="text-sm font-medium text-gray-700 mb-1 text-center">
                                    Arrastra y suelta una imagen aquí, o haz clic para seleccionar
                                </p>
                                <p className="text-xs text-gray-500 text-center">
                                    Soporta PNG, JPG. Máximo 5MB.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Información Básica */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Información Básica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Nombre del Producto *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                placeholder="Ej: Batido Nutricional, Té Herbal"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none transition-all ${errors.nombre ? 'border-red-500' : 'border-green-600/30'}`}
                            />
                            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Descripción</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                rows="3"
                                maxLength="500"
                                placeholder="Descripción del producto..."
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none resize-none transition-all ${errors.descripcion ? 'border-red-500' : 'border-green-600/30'}`}
                            />
                            {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
                            <p className="text-gray-400 text-xs text-right mt-1">{formData.descripcion.length}/500 caracteres</p>
                        </div>
                    </div>
                </div>

                {/* Precio y Valor */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Precio y Valor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Precio ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="precio"
                                value={formData.precio}
                                onChange={handleChange}
                                min="0"
                                placeholder="Ej: 15.50"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none transition-all ${errors.precio ? 'border-red-500' : 'border-green-600/30'}`}
                            />
                            {errors.precio && <p className="text-red-500 text-xs mt-1">{errors.precio}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Puntos Valor</label>
                            <input
                                type="number"
                                name="puntosValor"
                                value={formData.puntosValor}
                                onChange={handleChange}
                                min="0"
                                placeholder="Ej: 50"
                                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none transition-all ${errors.puntosValor ? 'border-red-500' : 'border-green-600/30'}`}
                            />
                            {errors.puntosValor && <p className="text-red-500 text-xs mt-1">{errors.puntosValor}</p>}
                        </div>
                    </div>
                </div>

                {/* Detalles del Producto */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Detalles del Producto</h3>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                            Ingredientes <span className="font-normal text-gray-500">(privado, visible solo admin/anfitrión)</span>
                        </label>
                        <textarea
                            name="ingredientes"
                            value={formData.ingredientes}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Lista de ingredientes..."
                            className="w-full px-4 py-2.5 border border-green-600/30 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none resize-none transition-all"
                        />
                    </div>
                </div>

                {/* Configuración de Combo */}
                <div>
                    <h3 className="text-base font-bold text-gray-800 mb-4">Configuración de Combo</h3>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, esCombo: !prev.esCombo }))}
                            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.esCombo ? 'bg-herbalife-green' : 'bg-gray-300'} flex-shrink-0`}
                        >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${formData.esCombo ? 'translate-x-5' : ''}`} />
                        </button>
                        <div>
                            <p className="text-sm font-bold text-gray-800">¿Es un Combo?</p>
                            <p className="text-xs text-gray-500">Activa esta opción si este producto es un paquete o combo</p>
                        </div>
                    </div>
                </div>

                {/* Notificaciones */}
                {userRole === "ANFITRION" ? (
                    <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-lg flex items-start gap-3 mt-4">
                        <div className="w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center text-blue-500 text-xs font-bold mt-0.5 flex-shrink-0">i</div>
                        <p className="text-sm text-blue-800">
                            <strong>Nota:</strong> Este producto/combo se creará en tu club y estará en estado <strong>PENDIENTE</strong> de aprobación por parte del administrador.
                        </p>
                    </div>
                ) : (
                    <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-lg flex items-start gap-3 mt-4">
                        <div className="w-5 h-5 rounded-full border border-blue-400 flex items-center justify-center text-blue-500 text-xs font-bold mt-0.5 flex-shrink-0">i</div>
                        <p className="text-sm text-blue-800">
                            <strong>Nota:</strong> Los productos se crean automáticamente en el Hub ID=1.
                        </p>
                    </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-6">
                    <button
                        type="button"
                        onClick={() => navigate("/productos")}
                        className="px-6 py-2 border border-gray-200 text-gray-700 font-bold text-sm rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-[#1b5e20] text-white font-bold text-sm rounded-lg hover:bg-[#144918] disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                        {isEdit ? "Actualizar" : "Guardar"}
                    </button>
                </div>
            </form>
        </div>
    );
}
