/**
 * 📦 ProductoService.js
 * Servicio para gestionar el catálogo global de productos
 * 
 * El administrador crea los productos disponibles para todos los clubes.
 * Los anfitriones solo ven (GET) los productos y gestionan disponibilidad local.
 */
import api from "../api/api";

const API_URL = "/productos";

// === OPERACIONES CRUD ===

/**
 * Obtiene todos los productos
 * @param {number} clubId - Opcional, filtra por club
 */
export const getAllProductos = (clubId = null) => {
    const params = clubId ? { clubId } : {};
    return api.get(API_URL, { params });
};

/** Obtiene un producto por ID */
export const getProductoById = (id) => api.get(`${API_URL}/${id}`);

/**
 * Crea un nuevo producto asociado a un Hub
 * @param {object} producto - { nombre, descripcion }
 * @param {number} hubId - ID del Hub (hardcoded to 1 in ProductoForm)
 */
export const createProducto = (producto, hubId) => {
    // ✅ Enviar hubId EN EL BODY (no como query param)
    // Backend detectará hubId en el DTO y usará createProductoFromHub
    const payload = {
        ...producto,
        hubId: hubId
    };
    return api.post(API_URL, payload);
};

/** Actualiza un producto existente */
export const updateProducto = (id, producto) => api.put(`${API_URL}/${id}`, producto);

// === OPERACIONES DE ESTADO ===

/** Activa un producto (disponible para venta) */
export const activarProducto = (id) => api.patch(`${API_URL}/${id}/activar`);

/** Desactiva un producto (no disponible) */
export const desactivarProducto = (id) => api.patch(`${API_URL}/${id}/desactivar`);
