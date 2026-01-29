/**
 * 📋 ProductoList.jsx
 * Lista del catálogo global de productos
 * El admin gestiona productos disponibles para todos los clubes
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Package, Power, PowerOff } from "lucide-react";
import Swal from "sweetalert2";
import {
    getAllProductos,
    activarProducto,
    desactivarProducto
} from "../../services/ProductoService";

export default function ProductoList() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        try {
            setLoading(true);
            const response = await getAllProductos();
            setProductos(response.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
            Swal.fire("Error", "No se pudieron cargar los productos", "error");
        } finally {
            setLoading(false);
        }
    };

    // === ACCIONES DE ESTADO ===
    const handleActivar = async (id) => {
        try {
            await activarProducto(id);
            Swal.fire("Activado", "Producto disponible", "success");
            fetchProductos();
        } catch (error) {
            Swal.fire("Error", "No se pudo activar", "error");
        }
    };

    const handleDesactivar = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Desactivar producto?",
            text: `"${nombre}" ya no estará disponible`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, desactivar",
        });
        if (result.isConfirmed) {
            try {
                await desactivarProducto(id);
                Swal.fire("Desactivado", "Producto no disponible", "info");
                fetchProductos();
            } catch (error) {
                Swal.fire("Error", "No se pudo desactivar", "error");
            }
        }
    };

    // === BADGE DE ESTADO ===
    const getEstadoBadge = (estado) => {
        return estado === "ACTIVO"
            ? "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Catálogo de Productos</h2>
                        <p className="text-sm text-gray-500">{productos.length} productos registrados</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate("/productos/create")}
                    className="flex items-center gap-2 px-4 py-2 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </button>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hub</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {productos.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No hay productos registrados
                                </td>
                            </tr>
                        ) : (
                            productos.map((producto) => (
                                <tr key={producto.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
                                                <Package className="w-5 h-5 text-orange-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{producto.nombre}</p>
                                                <p className="text-sm text-gray-500 max-w-xs truncate">
                                                    {producto.descripcion || "-"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{producto.hubNombre || "-"}</p>
                                            <p className="text-xs text-gray-500">Hub asociado</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(producto.estado)}`}>
                                            {producto.estado}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/productos/edit/${producto.id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Editar"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            {producto.estado === "ACTIVO" ? (
                                                <button
                                                    onClick={() => handleDesactivar(producto.id, producto.nombre)}
                                                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                                                    title="Desactivar"
                                                >
                                                    <PowerOff className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleActivar(producto.id)}
                                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                                    title="Activar"
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
