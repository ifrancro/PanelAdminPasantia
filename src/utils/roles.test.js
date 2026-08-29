import { describe, it, expect } from "vitest";
import {
    ROLES,
    PANEL_ROLES,
    getRole,
    hasRole,
    isPanelRole,
} from "./roles";

describe("roles", () => {
    it("getRole usa rolNombre", () => {
        expect(getRole({ rolNombre: "ADMIN" })).toBe("ADMIN");
        expect(getRole({ rolNombre: "admin" })).toBe("ADMIN");
    });

    it("getRole hace fallback a rol.nombre", () => {
        expect(getRole({ rol: { nombre: "ANFITRION" } })).toBe("ANFITRION");
    });

    it("getRole devuelve vacío sin rol", () => {
        expect(getRole(null)).toBe("");
        expect(getRole({})).toBe("");
        expect(getRole(undefined)).toBe("");
    });

    it("hasRole comprueba allowedRoles", () => {
        expect(hasRole({ rolNombre: "ADMIN" }, [ROLES.ADMIN])).toBe(true);
        expect(hasRole({ rolNombre: "ANFITRION" }, [ROLES.ADMIN])).toBe(false);
        expect(hasRole({ rolNombre: "SOCIO" }, [ROLES.ADMIN])).toBe(false);
    });

    it("PANEL_ROLES solo incluye ADMIN", () => {
        expect(PANEL_ROLES).toEqual([ROLES.ADMIN]);
    });

    it("isPanelRole acepta ADMIN y rechaza otros", () => {
        expect(isPanelRole({ rolNombre: "ADMIN" })).toBe(true);
        expect(isPanelRole({ rolNombre: "ANFITRION" })).toBe(false);
        expect(isPanelRole({ rolNombre: "SOCIO" })).toBe(false);
        expect(isPanelRole({ rolNombre: "USUARIO_BASICO" })).toBe(false);
    });
});
