import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Sidebar from "../components/Sidebar";
import { getSidebarSections, routeConfig } from "./routeConfig";
import { ROLES } from "../utils/roles";

const mockUseAuth = vi.fn();

vi.mock("../context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

describe("Sidebar desde routeConfig", () => {
    it("ADMIN ve todas las rutas con showInSidebar", () => {
        const admin = { rolNombre: ROLES.ADMIN };
        const sections = getSidebarSections(admin);
        const sidebarPaths = sections.flatMap((s) => s.links.map((l) => l.to));

        const expectedPaths = routeConfig
            .filter((r) => r.showInSidebar)
            .map((r) => r.sidebarTo);

        expect(sidebarPaths.sort()).toEqual(expectedPaths.sort());
    });

    it("ANFITRION no ve enlaces del sidebar (ninguna ruta le permite)", () => {
        const sections = getSidebarSections({ rolNombre: ROLES.ANFITRION });
        expect(sections).toEqual([]);
    });

    it("Sidebar ADMIN renderiza enlaces visibles permitidos", () => {
        mockUseAuth.mockReturnValue({
            user: { rolNombre: ROLES.ADMIN },
            logout: vi.fn(),
        });

        render(
            <MemoryRouter>
                <Sidebar />
            </MemoryRouter>
        );

        expect(screen.getByRole("link", { name: "Dashboard" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Usuarios" })).toBeTruthy();
        expect(screen.getByRole("link", { name: "Reportes" })).toBeTruthy();
        expect(screen.getByText("Cerrar Sesión")).toBeTruthy();
    });
});
