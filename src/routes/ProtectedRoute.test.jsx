import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = vi.fn();

vi.mock("../context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

function renderProtected(initialEntry = "/") {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <ProtectedRoute>
                <div data-testid="protected-content">Contenido protegido</div>
            </ProtectedRoute>
        </MemoryRouter>
    );
}

describe("ProtectedRoute", () => {
    it("muestra loading mientras verifica sesión", () => {
        mockUseAuth.mockReturnValue({
            loading: true,
            isAuthenticated: false,
        });

        renderProtected();
        expect(screen.getByText("Verificando sesión...")).toBeTruthy();
        expect(screen.queryByTestId("protected-content")).toBeNull();
    });

    it("sin sesión redirige a login", () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            isAuthenticated: false,
        });

        renderProtected();
        expect(screen.queryByTestId("protected-content")).toBeNull();
    });

    it("con sesión válida renderiza children", () => {
        mockUseAuth.mockReturnValue({
            loading: false,
            isAuthenticated: true,
            user: { rolNombre: "ADMIN" },
            token: "jwt",
        });

        renderProtected();
        expect(screen.getByTestId("protected-content")).toBeTruthy();
    });
});
