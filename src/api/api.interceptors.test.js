import { AxiosError } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import api from "./api";

vi.mock("sweetalert2", () => ({
    default: {
        fire: vi.fn(() => Promise.resolve()),
    },
}));

function rejectWithStatus(config, status) {
    return Promise.reject(
        new AxiosError(
            "Request failed",
            "ERR_BAD_REQUEST",
            config,
            null,
            {
                status,
                data: { message: "Unauthorized" },
                headers: {},
                config,
                statusText: "Unauthorized",
            }
        )
    );
}

describe("api interceptors", () => {
    const originalAdapter = api.defaults.adapter;

    beforeEach(() => {
        localStorage.clear();
        Swal.fire.mockClear();
        delete api.defaults.headers.common.Authorization;
        vi.unstubAllGlobals();
    });

    afterEach(() => {
        api.defaults.adapter = originalAdapter;
        localStorage.clear();
        vi.unstubAllGlobals();
    });

    it("POST /auth/login no lleva Authorization aunque haya token en localStorage", async () => {
        localStorage.setItem("token", "old-jwt");
        let captured;

        api.defaults.adapter = async (config) => {
            captured = config;
            return {
                data: { token: "new-jwt", rolNombre: "ADMIN" },
                status: 200,
                statusText: "OK",
                headers: {},
                config,
            };
        };

        await api.post("/auth/login", { email: "admin@demo.com", password: "123456" });

        const header = captured.headers?.Authorization
            || captured.headers?.authorization
            || (typeof captured.headers?.get === "function"
                ? captured.headers.get("Authorization")
                : undefined);

        expect(header).toBeFalsy();
    });

    it("401 de /auth/login no limpia sesión ni dispara Sesión expirada", async () => {
        localStorage.setItem("token", "keep-me");
        localStorage.setItem("user", JSON.stringify({ rolNombre: "ADMIN" }));

        api.defaults.adapter = async (config) => rejectWithStatus(config, 401);

        await expect(
            api.post("/auth/login", { email: "admin@demo.com", password: "wrong" })
        ).rejects.toMatchObject({ response: { status: 401 } });

        expect(localStorage.getItem("token")).toBe("keep-me");
        expect(localStorage.getItem("user")).toBeTruthy();
        expect(Swal.fire).not.toHaveBeenCalled();
    });

    it("401 de endpoint autenticado sí limpia sesión", async () => {
        localStorage.setItem("token", "expired-jwt");
        localStorage.setItem("user", JSON.stringify({ rolNombre: "ADMIN" }));

        vi.stubGlobal("location", {
            href: "http://localhost:5173/clubes",
            pathname: "/clubes",
            assign: vi.fn(),
            replace: vi.fn(),
        });

        api.defaults.adapter = async (config) => rejectWithStatus(config, 401);

        await expect(api.get("/clubes")).rejects.toMatchObject({ response: { status: 401 } });

        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("user")).toBeNull();
        expect(Swal.fire).toHaveBeenCalledWith(
            expect.objectContaining({ title: "Sesión expirada" })
        );
    });

    it("401 autenticado en /login limpia token y no redirige", async () => {
        localStorage.setItem("token", "expired-jwt");

        vi.stubGlobal("location", {
            href: "http://localhost:5173/login",
            pathname: "/login",
            assign: vi.fn(),
            replace: vi.fn(),
        });

        api.defaults.adapter = async (config) => rejectWithStatus(config, 401);

        await expect(api.get("/auth/me")).rejects.toMatchObject({ response: { status: 401 } });

        expect(localStorage.getItem("token")).toBeNull();
        expect(Swal.fire).not.toHaveBeenCalled();
        expect(window.location.href).toBe("http://localhost:5173/login");
    });
});
