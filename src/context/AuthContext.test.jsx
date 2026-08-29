import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import api from "../api/api";

vi.mock("../api/api", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        defaults: { headers: { common: {} } },
    },
}));

function Probe() {
    const { login } = useAuth();
    return (
        <button
            type="button"
            onClick={() => login("new-jwt", {
                userId: 1,
                email: "admin@demo.com",
                nombre: "Admin",
                rolNombre: "ADMIN",
            })}
        >
            do-login
        </button>
    );
}

describe("AuthContext checkAuth vs login", () => {
    beforeEach(() => {
        localStorage.clear();
        api.get.mockReset();
        delete api.defaults.headers.common.Authorization;
    });

    it("no borra un login nuevo si /auth/me viejo termina en 401", async () => {
        localStorage.setItem("token", "old-jwt");

        let rejectMe;
        api.get.mockImplementation(
            () => new Promise((_, reject) => {
                rejectMe = reject;
            })
        );

        const { getByText } = render(
            <AuthProvider>
                <Probe />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith("/auth/me");
        });

        act(() => {
            getByText("do-login").click();
        });

        expect(localStorage.getItem("token")).toBe("new-jwt");

        await act(async () => {
            rejectMe({ response: { status: 401 } });
        });

        expect(localStorage.getItem("token")).toBe("new-jwt");
        expect(JSON.parse(localStorage.getItem("user")).rolNombre).toBe("ADMIN");
    });
});
