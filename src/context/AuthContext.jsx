import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api/api";

/**
 * 🔐 AuthContext
 * Maneja autenticación global del usuario
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    /**
     * 🔴 Logout: limpia sesión
     */
    function logout(redirect = true) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setToken(null);

        if (redirect) window.location.href = "/login";
    }

    /**
     * 🔄 Al montar, restaura sesión desde localStorage
     * Ignora el resultado si el token cambió (login nuevo mientras /auth/me volaba).
     */
    useEffect(() => {
        let cancelled = false;

        const checkAuth = async () => {
            const storedToken = localStorage.getItem("token");

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

                // Siempre validar el token contra el backend para mayor seguridad
                // (VULN-REACT-03: No confiar ciegamente en localStorage.user)
                const res = await api.get("/auth/me");

                if (cancelled || localStorage.getItem("token") !== storedToken) {
                    return;
                }

                if (res.data.rolNombre !== "ADMIN") {
                    throw new Error("Rol no autorizado para el panel administrativo");
                }

                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
                setToken(storedToken);
            } catch (err) {
                if (cancelled || localStorage.getItem("token") !== storedToken) {
                    return;
                }
                const status = err?.response?.status;
                console.warn("Sesión inválida:", status ?? "sin status");
                logout(false);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        checkAuth();

        return () => {
            cancelled = true;
        };
    }, []);

    /**
     * 🟢 Login: guarda token y usuario
     */
    const login = (newToken, userData = null) => {
        try {
            localStorage.setItem("token", newToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            setToken(newToken);
            setLoading(false);

            if (userData) {
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
            }
        } catch {
            console.error("Error al guardar sesión");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: !!token && !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

/**
 * 🧩 Hook para acceder al contexto
 */
export const useAuth = () => useContext(AuthContext);
