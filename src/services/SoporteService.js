/**
 * 🎫 SoporteService.js
 * Servicio para gestionar tickets de soporte
 */
import api from "../api/api";

const API_URL = "/soporte-tickets";

// === OPERACIONES CRUD ===

/** Obtiene todos los tickets de soporte */
export const getAllTickets = () => api.get(API_URL);

/** Obtiene un ticket por ID */
export const getTicketById = (id) => api.get(`${API_URL}/${id}`);

/** Crea un nuevo ticket (normalmente desde app de usuarios) */
export const createTicket = (ticket) => api.post(API_URL, ticket);

// === OPERACIONES ADMINISTRATIVAS ===

/**
 * Responde a un ticket
 * @param {number} id - ID del ticket
 * @param {string} respuesta - Texto de la respuesta del admin
 */
export const responderTicket = (id, respuesta) =>
    api.patch(`${API_URL}/${id}/responder`, { respuesta });

/**
 * Cambia el estado de un ticket
 * @param {number} id - ID del ticket
 * @param {string} estado - ABIERTO, EN_PROCESO, CERRADO
 */
export const cambiarEstadoTicket = (id, estado) =>
    api.patch(`${API_URL}/${id}/estado`, null, { params: { estado } });
