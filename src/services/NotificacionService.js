/**
 * 🔔 NotificacionService.js
 * Servicio para gestionar notificaciones masivas
 * El admin puede enviar notificaciones a todos los usuarios o segmentadas
 */
import api from "../api/api";

const API_URL = "/notificaciones";

// === OPERACIONES DE ENVÍO ===

/**
 * Envía una notificación
 * @param {object} notificacion - Datos de la notificación
 * @param {number} hubId - Opcional, enviar a usuarios de un hub
 * @param {number} clubId - Opcional, enviar a usuarios de un club
 * @param {number} usuarioId - Opcional, enviar a un usuario específico
 */
export const enviarNotificacion = (notificacion, hubId = null, clubId = null, usuarioId = null) => {
    const params = {};
    if (hubId) params.hubId = hubId;
    if (clubId) params.clubId = clubId;
    if (usuarioId) params.usuarioId = usuarioId;

    return api.post(`${API_URL}/enviar`, notificacion, { params });
};

// === OPERACIONES DE CONSULTA ===

/** Obtiene historial completo de notificaciones */
export const getHistorialNotificaciones = () => api.get(API_URL);

/** Obtiene historial de notificaciones de un usuario */
export const getHistorialByUsuario = (usuarioId) =>
    api.get(`${API_URL}/usuario/${usuarioId}`);

/** Obtiene historial de notificaciones de un hub */
export const getHistorialByHub = (hubId) =>
    api.get(`${API_URL}/hub/${hubId}`);

/** Obtiene historial de notificaciones de un club */
export const getHistorialByClub = (clubId) =>
    api.get(`${API_URL}/club/${clubId}`);
