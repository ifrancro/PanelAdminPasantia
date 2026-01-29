/**
 * 📊 AsistenciaService.js
 * Servicio para consultar asistencias (solo lectura para admin)
 */
import api from "../api/api";

const API_URL = "/asistencias";

// === OPERACIONES DE LECTURA ===

/** Obtiene todas las asistencias */
export const getAllAsistencias = () => api.get(API_URL);

/** Obtiene asistencias de un socio específico */
export const getAsistenciasBySocio = (socioId) =>
    api.get(`${API_URL}/socio/${socioId}`);

/** Obtiene asistencias de un club específico */
export const getAsistenciasByClub = (clubId) =>
    api.get(`${API_URL}/club/${clubId}`);
