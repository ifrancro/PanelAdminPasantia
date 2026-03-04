import api from "../api/api";

const API_URL = "/logros";

export const getAllLogros = () => api.get(API_URL);
export const getLogroById = (id) => api.get(`${API_URL}/${id}`);
export const createLogro = (logro) => api.post(API_URL, logro);
export const updateLogro = (id, logro) => api.put(`${API_URL}/${id}`, logro);
export const deleteLogro = (id) => api.delete(`${API_URL}/${id}`);
export const activarLogro = (id) => api.patch(`${API_URL}/${id}/activar`);
export const inactivarLogro = (id) => api.patch(`${API_URL}/${id}/inactivar`);

/** Aprueba o rechaza un logro (solo ADMIN)
 * @param {number} id
 * @param {"APROBADO"|"RECHAZADO"} estadoAprobacion
 */
export const cambiarEstadoAprobacionLogro = (id, estadoAprobacion) =>
    api.patch(`${API_URL}/${id}/estado-aprobacion`, null, { params: { estadoAprobacion } });
