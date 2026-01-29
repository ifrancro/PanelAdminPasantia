/**
 * 🏢 HubService.js
 * Servicio para gestionar hubs (regiones/zonas geográficas)
 * Los hubs agrupan múltiples clubes
 */
import api from "../api/api";

const API_URL = "/hubs";

// === OPERACIONES CRUD ===

/** Obtiene todos los hubs */
export const getAllHubs = () => api.get(API_URL);

/** Obtiene un hub por ID */
export const getHubById = (id) => api.get(`${API_URL}/${id}`);

/** Crea un nuevo hub, requiere adminId del creador */
export const createHub = (hub, adminId) =>
    api.post(`${API_URL}?adminId=${adminId}`, hub);

/** Actualiza un hub existente */
export const updateHub = (id, hub) => api.put(`${API_URL}/${id}`, hub);

/** Elimina un hub */
export const deleteHub = (id) => api.delete(`${API_URL}/${id}`);

// === OPERACIONES DE ESTADO ===

/** Activa un hub */
export const activarHub = (id) => api.patch(`${API_URL}/${id}/activar`);

/** Inactiva un hub */
export const inactivarHub = (id) => api.patch(`${API_URL}/${id}/inactivar`);
