/**
 * 🏪 ClubService.js
 * Servicio para manejar operaciones relacionadas con clubes
 */
import api from '../api/api';

/**
 * Obtener todos los clubes
 */
export const getAllClubes = async () => {
    return await api.get('/clubes');
};

/**
 * Obtener un club por ID
 */
export const getClubById = async (id) => {
    return await api.get(`/clubes/${id}`);
};

/**
 * Aprobar un club (PENDIENTE -> ACTIVO)
 */
export const aprobarClub = async (id) => {
    return await api.patch(`/clubes/${id}/aprobar`);
};

/**
 * Rechazar un club (PENDIENTE -> RECHAZADO)
 */
export const rechazarClub = async (id) => {
    return await api.patch(`/clubes/${id}/rechazar`);
};

/**
 * Activar un club (INACTIVO -> ACTIVO)
 */
export const activarClub = async (id) => {
    return await api.patch(`/clubes/${id}/activar`);
};

/**
 * Desactivar un club (ACTIVO -> INACTIVO)
 */
export const desactivarClub = async (id) => {
    return await api.patch(`/clubes/${id}/desactivar`);
};

/**
 * Actualizar información de un club
 */
export const updateClub = async (id, clubData) => {
    return await api.put(`/clubes/${id}`, clubData);
};
