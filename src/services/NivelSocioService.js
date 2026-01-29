import api from "../api/api";

const API_URL = "/niveles-socio";  // Plural, como está en el backend

export const getAllNivelesSocio = () => api.get(API_URL);
export const getNivelSocioById = (id) => api.get(`${API_URL}/${id}`);
export const createNivelSocio = (nivel) => api.post(API_URL, nivel);
export const updateNivelSocio = (id, nivel) => api.put(`${API_URL}/${id}`, nivel);
export const deleteNivelSocio = (id) => api.delete(`${API_URL}/${id}`);

