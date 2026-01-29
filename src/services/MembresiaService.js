/**
 * 🎟️ MembresiaService.js
 * Servicio para consultar y actualizar membresías
 */
import api from "../api/api";

const API_URL = "/membresias";

// === OPERACIONES DE LECTURA ===

/** Obtiene una membresía por ID */
export const getMembresiaById = (id) => api.get(`${API_URL}/${id}`);

/** Obtiene membresía de un usuario específico */
export const getMembresiaByUsuario = (usuarioId) =>
    api.get(`${API_URL}/usuario/${usuarioId}`);

// === OPERACIONES ADMINISTRATIVAS ===

/**
 * Actualiza el nivel de una membresía (admin override)
 * @param {number} id - ID de la membresía
 * @param {number} nivelId - ID del nuevo nivel
 */
export const actualizarNivel = (id, nivelId) =>
    api.patch(`${API_URL}/${id}/actualizar-nivel`, null, { params: { nivelId } });

/**
 * Actualiza los puntos de una membresía (admin override)
 * @param {number} id - ID de la membresía
 * @param {number} puntos - Nuevos puntos
 */
export const actualizarPuntos = (id, puntos) =>
    api.patch(`${API_URL}/${id}/actualizar-puntos`, null, { params: { puntos } });
