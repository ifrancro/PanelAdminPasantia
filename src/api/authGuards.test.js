import { describe, it, expect } from "vitest";
import {
    getRequestBearerToken,
    isAuthLoginRequest,
    shouldHandleSessionExpired,
    stripAuthorizationHeader,
} from "./authGuards";

describe("isAuthLoginRequest", () => {
    it("detecta /auth/login relativo", () => {
        expect(isAuthLoginRequest({ url: "/auth/login" })).toBe(true);
        expect(isAuthLoginRequest({ url: "auth/login" })).toBe(true);
    });

    it("detecta URL absoluta y combinada con baseURL /api", () => {
        expect(isAuthLoginRequest({
            url: "https://clubs-api.onrender.com/api/auth/login",
        })).toBe(true);

        expect(isAuthLoginRequest({
            baseURL: "https://clubs-api.onrender.com/api",
            url: "/auth/login",
        })).toBe(true);
    });

    it("no abre /auth/** ni rutas parecidas", () => {
        expect(isAuthLoginRequest({ url: "/auth/me" })).toBe(false);
        expect(isAuthLoginRequest({ url: "/auth/login/extra" })).toBe(false);
        expect(isAuthLoginRequest({ url: "/clubes" })).toBe(false);
        expect(isAuthLoginRequest({ url: "/productos" })).toBe(false);
    });
});

describe("shouldHandleSessionExpired", () => {
    it("no trata 401 de /auth/login como sesión expirada", () => {
        expect(shouldHandleSessionExpired({
            response: { status: 401 },
            config: { url: "/auth/login" },
        })).toBe(false);
    });

    it("trata 401 autenticado como sesión expirada si el token coincide", () => {
        localStorage.setItem("token", "current-jwt");
        expect(shouldHandleSessionExpired({
            response: { status: 401 },
            config: {
                url: "/auth/me",
                headers: { Authorization: "Bearer current-jwt" },
            },
        })).toBe(true);
        localStorage.removeItem("token");
    });

    it("ignora 401 stale si el Bearer ya no es el token actual", () => {
        localStorage.setItem("token", "new-jwt");
        expect(shouldHandleSessionExpired({
            response: { status: 401 },
            config: {
                url: "/auth/me",
                headers: { Authorization: "Bearer old-jwt" },
            },
        })).toBe(false);
        localStorage.removeItem("token");
    });
});

describe("stripAuthorizationHeader", () => {
    it("elimina Authorization", () => {
        const config = { headers: { Authorization: "Bearer leftover" } };
        stripAuthorizationHeader(config);
        expect(config.headers.Authorization).toBeUndefined();
        expect(getRequestBearerToken(config)).toBeNull();
    });
});
