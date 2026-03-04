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

/** Obtiene TODAS las membresías de un club (para listado admin) */
export const getAllMembresiasByClub = (clubId) =>
    api.get(`${API_URL}/club/${clubId}`);

// === OPERACIONES ADMINISTRATIVAS ===

/**
 * Cambia el estado de una membresía (admin)
 * @param {number} id - ID de la membresía
 * @param {string} estado - Nuevo estado (ACTIVA/INACTIVA/etc)
 */
export const actualizarEstado = (id, estado) =>
    api.patch(`${API_URL}/${id}/estado`, null, { params: { estado } });

/** * Actualiza el nivel de una membresía (admin override)
 * @param {number} id - ID de la membresía
 * @param {number} nivelId - ID del nuevo nivel
 */
export const actualizarNivel = (id, nivelId) =>
    api.patch(`${API_URL}/${id}/nivel`, null, { params: { nivelId } });

/**
 * Actualiza los puntos de una membresía (admin override)
 * @param {number} id - ID de la membresía
 * @param {number} puntos - Nuevos puntos
 */
export const actualizarPuntos = (id, puntos) =>
    api.patch(`${API_URL}/${id}/puntos`, null, { params: { puntos } });

/**
 * Obtiene el árbol de referidos de una membresía (admin)
 * @param {number} id - ID de la membresía raíz
 * @returns Objeto recursivo con nodos: membresiaId, numeroSocio, nombreCompleto, puntosAcumulados, estado, referidos[]
 */
export const getArbolReferidos = (id) => api.get(`${API_URL}/${id}/arbol-referidos`);
