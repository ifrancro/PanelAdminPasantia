/**
 * Helpers de auth HTTP (WEB-AUTH-001).
 * Solo identifican /auth/login de forma exacta; no abren /auth/**.
 */

function toPathname(value) {
    if (!value) return "";
    const raw = String(value).split("#")[0].split("?")[0];
    try {
        if (/^https?:\/\//i.test(raw)) {
            return new URL(raw).pathname;
        }
    } catch {
        /* usar raw */
    }
    return raw;
}

function normalizePathname(pathname) {
    const withSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return withSlash.replace(/\/+$/, "") || "/";
}

function isAuthLoginPath(pathname) {
    const normalized = normalizePathname(pathname);
    return normalized === "/auth/login" || normalized.endsWith("/auth/login");
}

/**
 * True solo para la ruta de login (relativa, absoluta o combinada con baseURL).
 */
export function isAuthLoginRequest(config = {}) {
    const url = String(config.url || "");
    const baseURL = String(config.baseURL || "");

    if (url && isAuthLoginPath(toPathname(url))) {
        return true;
    }

    if (url && baseURL && !/^https?:\/\//i.test(url)) {
        const combined = `${baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
        if (isAuthLoginPath(toPathname(combined))) {
            return true;
        }
    }

    return false;
}

export function stripAuthorizationHeader(config) {
    const headers = config?.headers;
    if (!headers) return config;

    if (typeof headers.delete === "function") {
        headers.delete("Authorization");
        headers.delete("authorization");
    } else {
        delete headers.Authorization;
        delete headers.authorization;
    }

    return config;
}

export function getRequestBearerToken(config = {}) {
    const headers = config.headers;
    if (!headers) return null;

    let raw = null;
    if (typeof headers.get === "function") {
        raw = headers.get("Authorization") || headers.get("authorization");
    } else {
        raw = headers.Authorization || headers.authorization;
    }

    if (!raw) return null;
    return String(raw).replace(/^Bearer\s+/i, "").trim() || null;
}

/**
 * 401 de /auth/login = credenciales, no sesión.
 * 401 de un request con Bearer distinto al token actual = respuesta stale.
 */
export function shouldHandleSessionExpired(error) {
    if (error?.response?.status !== 401) return false;

    const config = error.config || error.response?.config || {};
    if (isAuthLoginRequest(config)) return false;

    const requestToken = getRequestBearerToken(config);
    const currentToken = localStorage.getItem("token");
    if (requestToken && currentToken && requestToken !== currentToken) {
        return false;
    }

    return true;
}

export function isOnLoginPage() {
    if (typeof window === "undefined") return false;
    return window.location.pathname === "/login";
}
