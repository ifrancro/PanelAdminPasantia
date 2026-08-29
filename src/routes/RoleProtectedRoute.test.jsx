import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RoleProtectedRoute from "./RoleProtectedRoute";
import { ROLES } from "../utils/roles";

const mockUseAuth = vi.fn();

vi.mock("../context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

describe("RoleProtectedRoute", () => {
    it("ADMIN permitido renderiza children", () => {
        mockUseAuth.mockReturnValue({
            user: { rolNombre: ROLES.ADMIN },
        });

        render(
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <div data-testid="admin-module">Módulo admin</div>
            </RoleProtectedRoute>
        );

        expect(screen.getByTestId("admin-module")).toBeTruthy();
    });

    it("ANFITRION mock rechazado en ruta ADMIN-only", () => {
        mockUseAuth.mockReturnValue({
            user: { rolNombre: ROLES.ANFITRION },
        });

        render(
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <div data-testid="admin-module">Módulo admin</div>
            </RoleProtectedRoute>
        );

        expect(screen.queryByTestId("admin-module")).toBeNull();
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });

    it("SOCIO mock rechazado en ruta ADMIN-only", () => {
        mockUseAuth.mockReturnValue({
            user: { rolNombre: ROLES.SOCIO },
        });

        render(
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <div data-testid="admin-module">Módulo admin</div>
            </RoleProtectedRoute>
        );

        expect(screen.queryByTestId("admin-module")).toBeNull();
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });

    it("autenticado sin permiso no muestra el módulo (403, sin logout)", () => {
        mockUseAuth.mockReturnValue({
            user: { rolNombre: ROLES.ANFITRION },
        });

        render(
            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                <div data-testid="usuarios-module">Usuarios</div>
            </RoleProtectedRoute>
        );

        expect(screen.getByText(/No tienes permisos/i)).toBeTruthy();
        expect(screen.queryByTestId("usuarios-module")).toBeNull();
    });
});
