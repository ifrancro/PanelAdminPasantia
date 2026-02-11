/**
 * 🏪 ClubService.js
 * Servicio para gestionar clubes desde el panel admin
 * Incluye operaciones CRUD + aprobar/rechazar/activar/desactivar
 */
import api from "../api/api";

const API_URL = "/clubes";

// === OPERACIONES CRUD ===

/**
 * Obtiene todos los clubes
 * @param {number} hubId - Opcional, filtra por hub
 */
export const getClubes = async (hubId = null) => {
    const params = hubId ? { hubId } : {};
    const response = await api.get(API_URL, { params });
    return response.data;
};

/**
 * Obtiene un club por ID
 */
export const getClubById = (id) => api.get(`${API_URL}/${id}`);

/**
 * Crea un nuevo club
 * @param {object} club - Datos del club
 * @param {number} hubId - ID del hub al que pertenece
 * @param {number} anfitrionId - ID del usuario anfitrión
 */
export const createClub = (club, hubId, anfitrionId) =>
    api.post(`${API_URL}?hubId=${hubId}&anfitrionId=${anfitrionId}`, club);

/**
 * Actualiza un club existente
 */
export const updateClub = (id, club) => api.put(`${API_URL}/${id}`, club);

// === OPERACIONES DE ESTADO ===

/**
 * Aprueba una solicitud de club (estado: ACTIVO)
 * El usuario solicitante pasa a ser Anfitrión
 */
export const aprobarClub = (id) => api.patch(`${API_URL}/${id}/aprobar`);

/**
 * Rechaza una solicitud de club (estado: RECHAZADO)
 */
export const rechazarClub = (id) => api.patch(`${API_URL}/${id}/rechazar`);

/**
 * Activa un club previamente desactivado
 */
export const activarClub = (id) => api.patch(`${API_URL}/${id}/activar`);

/**
 * Desactiva un club activo (por incumplimiento de normas, etc.)
 */
export const desactivarClub = (id) => api.patch(`${API_URL}/${id}/desactivar`);

// Export default como objeto
export const clubService = {
    getClubes,
    getClubById,
    createClub,
    updateClub,
    aprobarClub,
    rechazarClub,
    activarClub,
    desactivarClub,
};
