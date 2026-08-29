/**
 * Roles y autorización del panel (WEB-AUTH-002).
 * Fuente única para normalizar rol y comprobar permisos.
 */

export const ROLES = {
    ADMIN: "ADMIN",
    ANFITRION: "ANFITRION",
    SOCIO: "SOCIO",
    USUARIO_BASICO: "USUARIO_BASICO",
};

/** Roles que pueden iniciar o restaurar sesión en el panel (solo ADMIN por ahora). */
export const PANEL_ROLES = [ROLES.ADMIN];

/**
 * @param {object|null|undefined} user
 * @returns {string} Rol en mayúsculas o cadena vacía
 */
export function getRole(user) {
    return String(user?.rolNombre ?? user?.rol?.nombre ?? "").toUpperCase();
}

/**
 * @param {object|null|undefined} user
 * @param {string[]} allowedRoles
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
    const role = getRole(user);
    if (!role || !Array.isArray(allowedRoles) || allowedRoles.length === 0) {
        return false;
    }
    return allowedRoles.includes(role);
}

/**
 * @param {object|null|undefined} user
 * @returns {boolean}
 */
export function isPanelRole(user) {
    return hasRole(user, PANEL_ROLES);
}
