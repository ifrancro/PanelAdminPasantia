/**
 * 👥 UsuarioService.js
 * Servicio para gestionar usuarios (solo lectura para admin)
 */
import api from "../api/api";

const API_URL = "/usuarios";

// === OPERACIONES DE LECTURA ===

/** Obtiene todos los usuarios */
export const getAllUsuarios = () => api.get(API_URL);

/** Obtiene un usuario por ID */
export const getUsuarioById = (id) => api.get(`${API_URL}/${id}`);

/** Obtiene perfil de un usuario */
export const getPerfilUsuario = (id) => api.get(`${API_URL}/perfil/${id}`);

// === OPERACIONES ADMINISTRATIVAS ===

/** Desactiva un usuario */
export const desactivarUsuario = (id) => api.patch(`${API_URL}/${id}/desactivar`);
