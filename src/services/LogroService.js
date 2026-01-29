import api from "../api/api";

const API_URL = "/logros";  // Plural, como está en el backend

export const getAllLogros = () => api.get(API_URL);
export const getLogroById = (id) => api.get(`${API_URL}/${id}`);
export const createLogro = (logro) => api.post(API_URL, logro);
export const updateLogro = (id, logro) => api.put(`${API_URL}/${id}`, logro);
export const deleteLogro = (id) => api.delete(`${API_URL}/${id}`);

