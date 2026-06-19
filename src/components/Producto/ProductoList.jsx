/**
 * 📦 ProductoList.jsx
 * Dos pestañas: catálogo general + bandeja de pendientes
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Package, Power, PowerOff, CheckCircle, XCircle, Clock, Building2 } from "lucide-react";
import Swal from "sweetalert2";
import { getFullImageUrl } from "../../utils/imageUtils";
import {
    getAllProductos,
    activarProducto,
    desactivarProducto,
    cambiarEstadoAprobacionProducto,
    getProductosPendientes,
    toggleDisponibilidadProducto,
} from "../../services/ProductoService";
import { getAllClubes } from "../../services/ClubService";
import { useAuth } from "../../context/AuthContext";

// ─── Constantes ─────────────────────────────────────────────────────────────

const APROBACION_BADGE = {
    APROBADO:  { cls: "bg-green-100 text-green-700 border-green-300",  label: "Aprobado"  },
    PENDIENTE: { cls: "bg-yellow-100 text-yellow-700 border-yellow-300", label: "Pendiente" },
    RECHAZADO: { cls: "bg-red-100 text-red-700 border-red-300",         label: "Rechazado" },
};

// ─── Componente principal ───────────────────────────────────────────────────

export default function ProductoList() {
    const { user } = useAuth();
    const userRole = user?.rol?.nombre?.toUpperCase();

    const [productos, setProductos] = useState([]);
    const [pendientes, setPendientes] = useState([]);
    const [clubes, setClubes] = useState([]);
    const [miClub, setMiClub] = useState(null);
    const [clubFiltro, setClubFiltro] = useState(""); // "" = todos
    const [loading, setLoading] = useState(true);
    const [loadingPendientes, setLoadingPendientes] = useState(false);
    const [loadingAprobacion, setLoadingAprobacion] = useState({}); // { [id]: true }
    const [tab, setTab] = useState("todos");
    const navigate = useNavigate();

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                const clubsRes = await getAllClubes();
                const clubsList = clubsRes.data || [];
                setClubes(clubsList);

                if (userRole === "ANFITRION") {
                    const foundClub = clubsList.find(c => c.anfitrionId === user?.id);
                    if (foundClub) {
                        setMiClub(foundClub);
                        setClubFiltro(foundClub.id);
                        const response = await getAllProductos(foundClub.id);
                        setProductos(response.data);
                    } else {
                        const response = await getAllProductos(null);
                        setProductos(response.data);
                    }
                } else {
                    const response = await getAllProductos(null);
                    setProductos(response.data);
                    fetchPendientes();
                }
            } catch (error) {
                console.error("Error al inicializar productos:", error);
                Swal.fire("Error", "No se pudieron cargar los datos", "error");
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [user, userRole]);

    const fetchProductos = async (clubId = "") => {
        try {
            setLoading(true);
            const response = await getAllProductos(clubId || null);
            setProductos(response.data);
        } catch {
            Swal.fire("Error", "No se pudieron cargar los productos", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClubChange = (e) => {
        const val = e.target.value;
        setClubFiltro(val);
        fetchProductos(val);
    };

    const handleToggleDisponibilidad = async (productoId) => {
        const targetClubId = clubFiltro || (miClub ? miClub.id : null);
        if (!targetClubId) {
            Swal.fire("Aviso", "No se detectó un club asociado para cambiar la disponibilidad", "warning");
            return;
        }
        try {
            const response = await toggleDisponibilidadProducto(targetClubId, productoId);
            const updated = response.data;
            
            // Actualizar localmente el estado del producto
            setProductos(prev => prev.map(p => {
                if (p.id === productoId) {
                    return { ...p, disponible: updated.disponible };
                }
                return p;
            }));
            
            Swal.fire({
                icon: "success",
                title: updated.disponible ? "Habilitado en menú" : "Deshabilitado de menú",
                text: `"${updated.nombre}" ha sido ${updated.disponible ? 'habilitado' : 'deshabilitado'} en tu club.`,
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error("Error al cambiar disponibilidad:", error);
            Swal.fire("Error", "No se pudo cambiar la disponibilidad del producto", "error");
        }
    };

    const fetchPendientes = async () => {
        try {
            setLoadingPendientes(true);
            const response = await getProductosPendientes();
            setPendientes(response.data);
        } catch {
            // silencioso — no bloquear la carga principal
        } finally {
            setLoadingPendientes(false);
        }
    };

    // ── Activar / Desactivar ─────────────────────────────────────────────────

    const handleActivar = async (id) => {
        try {
            await activarProducto(id);
            Swal.fire({ icon: "success", title: "Activado", text: "Producto disponible", timer: 1500, showConfirmButton: false });
            fetchProductos();
        } catch { Swal.fire("Error", "No se pudo activar", "error"); }
    };

    const handleDesactivar = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Desactivar producto?",
            text: `"${nombre}" ya no estará disponible`,
            icon: "warning", showCancelButton: true,
            confirmButtonText: "Sí, desactivar", cancelButtonText: "Cancelar",
        });
        if (!result.isConfirmed) return;
        try {
            await desactivarProducto(id);
            Swal.fire({ icon: "info", title: "Desactivado", timer: 1500, showConfirmButton: false });
            fetchProductos();
        } catch { Swal.fire("Error", "No se pudo desactivar", "error"); }
    };

    // ── Aprobar / Rechazar ───────────────────────────────────────────────────

    const handleAprobacion = async (producto, nuevoEstado) => {
        const esAprobado = nuevoEstado === "APROBADO";
        const result = await Swal.fire({
            title: esAprobado ? "¿Aprobar producto?" : "¿Rechazar producto?",
            text: `"${producto.nombre}"${producto.clubCreadorNombre ? ` — solicitado por ${producto.clubCreadorNombre}` : ""}`,
            icon: esAprobado ? "question" : "warning",
            showCancelButton: true,
            confirmButtonColor: esAprobado ? "#16a34a" : "#dc2626",
            cancelButtonColor: "#6b7280",
            confirmButtonText: esAprobado ? "Sí, aprobar" : "Sí, rechazar",
            cancelButtonText: "Cancelar",
        });
        if (!result.isConfirmed) return;

        setLoadingAprobacion(prev => ({ ...prev, [producto.id]: true }));
        try {
            await cambiarEstadoAprobacionProducto(producto.id, nuevoEstado);
            // Actualizar lista de pendientes localmente
            setPendientes(prev => prev.filter(p => p.id !== producto.id));
            // Refrescar tabla general
            fetchProductos();
            Swal.fire({
                icon: "success",
                title: esAprobado ? "Producto aprobado" : "Producto rechazado",
                text: `"${producto.nombre}" fue ${esAprobado ? "aprobado" : "rechazado"} correctamente.`,
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (err) {
            Swal.fire("Error",
                err?.response?.status === 403 ? "Sin permisos para realizar esta acción." : "No se pudo cambiar el estado.",
                "error");
        } finally {
            setLoadingAprobacion(prev => ({ ...prev, [producto.id]: false }));
        }
    };

    // ── Loading inicial ──────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full" />
            </div>
        );
    }

    const getEstadoBadge = (activo) =>
        activo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700";

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">

            {/* ── Header ── */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Package className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Catálogo de Productos</h2>
                        <p className="text-sm text-gray-500">{productos.length} productos registrados</p>
                    </div>
                    {pendientes.length > 0 && (
                        <span className="flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            {pendientes.length} pendiente{pendientes.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
                <button
                    onClick={() => navigate("/productos/create")}
                    className="flex items-center gap-2 px-4 py-2 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nuevo Producto
                </button>
            </div>

            {/* ── Tabs ── */}
            {userRole !== "ANFITRION" && (
                <div className="flex border-b border-gray-200 px-6">
                    <button
                        onClick={() => setTab("todos")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                            ${tab === "todos"
                                ? "border-herbalife-green text-herbalife-green"
                                : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        <Package className="w-4 h-4" />
                        Todos los Productos
                        <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">{productos.length}</span>
                    </button>
                    <button
                        onClick={() => setTab("pendientes")}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                            ${tab === "pendientes"
                                ? "border-yellow-500 text-yellow-600"
                                : "border-transparent text-gray-500 hover:text-gray-700"}`}
                    >
                        <Clock className="w-4 h-4" />
                        Solicitudes Pendientes
                        {pendientes.length > 0 && (
                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                {pendientes.length}
                            </span>
                        )}
                    </button>
                </div>
            )}

            {/* ══ TAB: TODOS ══ */}
            {tab === "todos" && (
                <div className="overflow-x-auto">
                    {/* Filtro por club / Mi club banner */}
                    {userRole === "ANFITRION" ? (
                        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
                            <Building2 className="w-4 h-4 text-herbalife-green flex-shrink-0" />
                            <span className="text-sm font-semibold text-gray-700">Mi Club:</span>
                            <span className="px-3 py-1 bg-herbalife-green/10 text-herbalife-green rounded-full text-xs font-semibold">
                                {miClub?.nombreClub || "Cargando..."}
                            </span>
                            <span className="text-xs text-gray-500 italic ml-2">
                                Gestiona la disponibilidad en tu menú. Los combos/productos locales creados por ti requieren aprobación del administrador.
                            </span>
                            <span className="ml-auto text-xs text-gray-400">{productos.length} producto(s)</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
                            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600">Filtrar por menú de club:</span>
                            <select
                                value={clubFiltro}
                                onChange={handleClubChange}
                                className="px-3 py-1.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none"
                            >
                                <option value="">Todos los productos</option>
                                {clubes.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombreClub}</option>
                                ))}
                            </select>
                            {clubFiltro && (
                                <button
                                    onClick={() => handleClubChange({ target: { value: "" } })}
                                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                                >
                                    Limpiar
                                </button>
                            )}
                            <span className="ml-auto text-xs text-gray-400">{productos.length} resultado{productos.length !== 1 ? "s" : ""}</span>
                        </div>
                    )}
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            {userRole === "ANFITRION" ? (
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">En menú de mi Club</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aprobación</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hub</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aprobación</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            )}
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {productos.length === 0 ? (
                                <tr>
                                    <td colSpan={userRole === "ANFITRION" ? "6" : "5"} className="px-6 py-8 text-center text-gray-500">
                                        No hay productos registrados
                                    </td>
                                </tr>
                            ) : (
                                productos.map((producto) => {
                                    const esPendiente = producto.estadoAprobacion === "PENDIENTE";
                                    const aprobacion = APROBACION_BADGE[producto.estadoAprobacion] || { cls: "bg-gray-100 text-gray-600 border-gray-300", label: producto.estadoAprobacion || "N/A" };
                                    const esAnfitrion = userRole === "ANFITRION";
                                    const esGlobal = producto.tipo === "GLOBAL";

                                    return (
                                        <tr key={producto.id} className={`hover:bg-gray-50 ${esPendiente ? "bg-yellow-50/40" : ""}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {producto.imagenUrl ? (
                                                        <img src={getFullImageUrl(producto.imagenUrl)} alt={producto.nombre}
                                                            className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-200 flex-shrink-0"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-5 h-5 text-orange-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium text-gray-800 flex items-center gap-2">
                                                            {producto.nombre}
                                                            {producto.esCombo && (
                                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-700 border border-orange-200 rounded-full flex items-center gap-0.5 flex-shrink-0 font-semibold shadow-sm">
                                                                    🍹 Combo
                                                                </span>
                                                            )}
                                                        </p>
                                                        <p className="text-sm text-gray-500 max-w-xs truncate">
                                                            {producto.clubCreadorNombre
                                                                ? <span className="text-purple-600 font-medium">{producto.clubCreadorNombre}</span>
                                                                : producto.descripcion || "-"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {esAnfitrion ? (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-semibold text-gray-800">
                                                            ${producto.precio != null ? Number(producto.precio).toFixed(2) : "0.00"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${esGlobal ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}`}>
                                                            {producto.tipo || "LOCAL"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleDisponibilidad(producto.id)}
                                                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${producto.disponible ? 'bg-herbalife-green' : 'bg-gray-300'}`}
                                                                title={producto.disponible ? "Deshabilitar en mi menú" : "Habilitar en mi menú"}
                                                            >
                                                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${producto.disponible ? 'translate-x-5' : ''}`} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {esGlobal ? (
                                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
                                                                Aprobado
                                                            </span>
                                                        ) : (
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${aprobacion.cls}`}>
                                                                {aprobacion.label}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            {!esGlobal ? (
                                                                <button
                                                                    onClick={() => navigate(`/productos/edit/${producto.id}`)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Editar"
                                                                >
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 italic" title="Los productos globales solo los edita el Administrador">
                                                                    Global
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-gray-800">{producto.hubNombre || "-"}</p>
                                                        <p className="text-xs text-gray-500">Hub asociado</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoBadge(producto.activo)}`}>
                                                            {producto.activo ? "ACTIVO" : "INACTIVO"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${aprobacion.cls}`}>
                                                            {aprobacion.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex justify-end gap-1">
                                                            {esPendiente && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleAprobacion(producto, "APROBADO")}
                                                                        disabled={loadingAprobacion[producto.id]}
                                                                        title="Aprobar"
                                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-40"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleAprobacion(producto, "RECHAZADO")}
                                                                        disabled={loadingAprobacion[producto.id]}
                                                                        title="Rechazar"
                                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-40"
                                                                    >
                                                                        <XCircle className="w-4 h-4" />
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => navigate(`/productos/edit/${producto.id}`)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                title="Editar"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                            {producto.activo ? (
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
                                                </>
                                            )}
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ══ TAB: PENDIENTES ══ */}
            {tab === "pendientes" && (
                <div>
                    {loadingPendientes ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full" />
                        </div>
                    ) : pendientes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
                            <CheckCircle className="w-12 h-12 text-green-300" />
                            <p className="text-lg font-medium">¡Todo al día!</p>
                            <p className="text-sm">No hay productos pendientes de aprobación.</p>
                        </div>
                    ) : (
                        <>
                            <div className="mx-6 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-sm text-yellow-800">
                                <Clock className="w-4 h-4 flex-shrink-0" />
                                <span>
                                    <strong>{pendientes.length} producto{pendientes.length !== 1 ? "s" : ""}</strong> esperando tu revisión.
                                </span>
                            </div>
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Club Solicitante</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                                            <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Puntos Valor</th>
                                            <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase">Decisión</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pendientes.map(prod => {
                                            const isProcessing = loadingAprobacion[prod.id];
                                            return (
                                                <tr key={prod.id} className="hover:bg-yellow-50/50 bg-yellow-50/20">
                                                    {/* Club */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-lg bg-herbalife-green/10 flex items-center justify-center flex-shrink-0">
                                                                <span className="text-xs font-bold text-herbalife-green">
                                                                    {prod.clubCreadorNombre?.charAt(0) || "?"}
                                                                </span>
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-800">
                                                                {prod.clubCreadorNombre || <span className="text-gray-400 italic">Sin club</span>}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {/* Producto */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            {prod.imagenUrl ? (
                                                                <img src={getFullImageUrl(prod.imagenUrl)} alt={prod.nombre}
                                                                    className="w-10 h-10 rounded-lg object-contain bg-white border border-gray-200 flex-shrink-0"
                                                                    onError={(e) => {
                                                                        e.target.onerror = null;
                                                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5OL0E8L3RleHQ+PC9zdmc+';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                    <Package className="w-5 h-5 text-orange-500" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-800">{prod.nombre}</p>
                                                                <p className="text-xs text-gray-400">{prod.hubNombre || "—"}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Descripción */}
                                                    <td className="px-5 py-4 max-w-xs">
                                                        <p className="text-xs text-gray-600 truncate">{prod.descripcion || "—"}</p>
                                                        {prod.ingredientes && (
                                                            <p className="text-xs text-gray-400 mt-0.5 italic truncate">Ing: {prod.ingredientes}</p>
                                                        )}
                                                    </td>
                                                    {/* Puntos */}
                                                    <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                                                        {prod.puntosValor != null ? `${prod.puntosValor} pts` : "—"}
                                                    </td>
                                                    {/* Botones */}
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => handleAprobacion(prod, "APROBADO")}
                                                                disabled={isProcessing}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 transition-colors"
                                                            >
                                                                {isProcessing
                                                                    ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                    : <CheckCircle className="w-3.5 h-3.5" />}
                                                                Aprobar
                                                            </button>
                                                            <button
                                                                onClick={() => handleAprobacion(prod, "RECHAZADO")}
                                                                disabled={isProcessing}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 disabled:opacity-40 transition-colors"
                                                            >
                                                                {isProcessing
                                                                    ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                                    : <XCircle className="w-3.5 h-3.5" />}
                                                                Rechazar
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
