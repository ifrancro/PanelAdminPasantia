/**
 * 📅 EventoService.js
 * Servicio para gestionar eventos corporativos
 * Los eventos son visibles para todos los usuarios
 */
import api from "../api/api";

const API_URL = "/eventos";

// === OPERACIONES CRUD ===

/**
 * Obtiene todos los eventos
 * @param {number} hubId - Opcional, filtrar por hub
 * @param {number} clubId - Opcional, filtrar por club
 */
export const getAllEventos = (hubId = null, clubId = null) => {
    const params = {};
    if (hubId) params.hubId = hubId;
    if (clubId) params.clubId = clubId;
    return api.get(API_URL, { params });
};

/** Obtiene un evento por ID */
export const getEventoById = (id) => api.get(`${API_URL}/${id}`);

/**
 * Crea un nuevo evento
 * @param {object} evento - Datos del evento
 * @param {number} hubId - Opcional, asociar a hub
 * @param {number} clubId - Opcional, asociar a club
 */
export const createEvento = (evento, hubId = null, clubId = null) => {
    const params = {};
    if (hubId) params.hubId = hubId;
    if (clubId) params.clubId = clubId;
    return api.post(API_URL, evento, { params });
};

/** Actualiza un evento existente */
export const updateEvento = (id, evento) => api.put(`${API_URL}/${id}`, evento);

/** Elimina un evento */
export const deleteEvento = (id) => api.delete(`${API_URL}/${id}`);
