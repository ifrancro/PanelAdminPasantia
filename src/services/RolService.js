import api from "../api/api";

const API_URL = "/roles";  // Plural, como está en el backend

export const getAllRoles = () => api.get(API_URL);
export const getRolById = (id) => api.get(`${API_URL}/${id}`);
export const createRol = (rol) => api.post(API_URL, rol);
export const updateRol = (id, rol) => api.put(`${API_URL}/${id}`, rol);
export const deleteRol = (id) => api.delete(`${API_URL}/${id}`);

