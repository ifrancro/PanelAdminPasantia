import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";
import RoleProtectedRoute from "./RoleProtectedRoute";
import { routeConfig } from "./routeConfig";
import { ROLES } from "../utils/roles";

const mockUseAuth = vi.fn();

vi.mock("../context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

function UsuariosStub() {
    return <div data-testid="usuarios-page">Página usuarios</div>;
}

function renderDirectUrl(path, user) {
    mockUseAuth.mockReturnValue({
        loading: false,
        isAuthenticated: true,
        user,
        token: "jwt",
    });

    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <div />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/usuarios"
                    element={
                        <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={[ROLES.ADMIN]}>
                                <UsuariosStub />
                            </RoleProtectedRoute>
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
}

describe("acceso directo por URL", () => {
    beforeEach(() => {
        mockUseAuth.mockReset();
    });

    it("ADMIN accede a /usuarios", () => {
        renderDirectUrl("/usuarios", { rolNombre: ROLES.ADMIN });
        expect(screen.getByTestId("usuarios-page")).toBeTruthy();
    });

    it("ANFITRION no renderiza módulo en /usuarios", () => {
        renderDirectUrl("/usuarios", { rolNombre: ROLES.ANFITRION });
        expect(screen.queryByTestId("usuarios-page")).toBeNull();
        expect(screen.getByText("Acceso denegado")).toBeTruthy();
    });

    it("SOCIO no renderiza módulo en /usuarios", () => {
        renderDirectUrl("/usuarios", { rolNombre: ROLES.SOCIO });
        expect(screen.queryByTestId("usuarios-page")).toBeNull();
    });
});

describe("routeConfig", () => {
    it("todas las rutas actuales son ADMIN-only", () => {
        for (const route of routeConfig) {
            expect(route.allowedRoles).toEqual([ROLES.ADMIN]);
        }
    });

    it("ninguna ruta incluye ANFITRION", () => {
        for (const route of routeConfig) {
            expect(route.allowedRoles).not.toContain(ROLES.ANFITRION);
        }
    });
});
