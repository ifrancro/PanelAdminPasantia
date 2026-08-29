import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import { AuthProvider } from "../context/AuthContext";
import LoginPage from "./LoginPage";
import api from "../api/api";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

vi.mock("sweetalert2", () => ({
    default: {
        fire: vi.fn(() => Promise.resolve()),
    },
}));

vi.mock("../api/api", () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        defaults: { headers: { common: {} } },
    },
}));

function renderLogin() {
    return render(
        <MemoryRouter>
            <AuthProvider>
                <LoginPage />
            </AuthProvider>
        </MemoryRouter>
    );
}

function fillAndSubmit(emailValue, passwordValue) {
    fireEvent.change(screen.getByPlaceholderText("tucorreo@ejemplo.com"), {
        target: { value: emailValue },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: passwordValue },
    });
    fireEvent.submit(screen.getByRole("button", { name: /iniciar sesión/i }).closest("form"));
}

describe("LoginPage", () => {
    beforeEach(() => {
        localStorage.clear();
        navigateMock.mockReset();
        Swal.fire.mockClear();
        api.post.mockReset();
        api.get.mockReset();
        delete api.defaults.headers.common.Authorization;
    });

    it("normaliza el email y envía la password exactamente como se escribió", async () => {
        api.post.mockResolvedValue({
            data: {
                token: "jwt-admin",
                userId: 1,
                email: "admin@demo.com",
                nombre: "Admin",
                apellido: "Demo",
                rolNombre: "ADMIN",
            },
        });

        renderLogin();
        fillAndSubmit("  Admin@Demo.com ", "  abc123  ");

        await waitFor(() => {
            expect(api.post).toHaveBeenCalled();
        });

        expect(api.post).toHaveBeenCalledWith("/auth/login", {
            email: "admin@demo.com",
            password: "  abc123  ",
        });
    });

    it("login ADMIN 200 persiste token/user y navega a /", async () => {
        api.post.mockResolvedValue({
            data: {
                token: "jwt-admin",
                userId: 1,
                email: "admin@demo.com",
                nombre: "Admin",
                apellido: "Demo",
                rolNombre: "ADMIN",
            },
        });

        renderLogin();
        fillAndSubmit("admin@demo.com", "123456");

        await waitFor(() => {
            expect(localStorage.getItem("token")).toBe("jwt-admin");
        });

        expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({
            userId: 1,
            rolNombre: "ADMIN",
        });
        expect(navigateMock).toHaveBeenCalledWith("/");
    });

    it("ANFITRION es rechazado y no persiste sesión", async () => {
        api.post.mockResolvedValue({
            data: {
                token: "jwt-host",
                userId: 2,
                email: "host@demo.com",
                nombre: "Host",
                apellido: "Demo",
                rolNombre: "ANFITRION",
            },
        });

        renderLogin();
        fillAndSubmit("host@demo.com", "123456");

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({ title: "Acceso denegado" })
            );
        });

        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("user")).toBeNull();
        expect(navigateMock).not.toHaveBeenCalled();
    });

    it("401 de login muestra credenciales incorrectas y no sesión expirada", async () => {
        api.post.mockRejectedValue({
            response: {
                status: 401,
                data: { message: "El correo o la contraseña son incorrectos" },
            },
        });

        renderLogin();
        fillAndSubmit("admin@demo.com", "wrongpass");

        await waitFor(() => {
            expect(Swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({ title: "Credenciales incorrectas" })
            );
        });

        expect(screen.getByText("Correo o contraseña incorrectos")).toBeTruthy();
        expect(Swal.fire).not.toHaveBeenCalledWith(
            expect.objectContaining({ title: "Sesión expirada" })
        );
        expect(localStorage.getItem("token")).toBeNull();
    });
});
