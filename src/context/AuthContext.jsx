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
     * 🔄 Al montar, restaura sesión desde localStorage
     */
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setToken(storedToken);
                    setLoading(false);
                    return;
                }

                // Obtener perfil actualizado
                const res = await api.get("/auth/me");
                setUser(res.data);
                localStorage.setItem("user", JSON.stringify(res.data));
                setToken(storedToken);
            } catch (err) {
                console.warn("⚠️ Sesión inválida:", err);
                logout(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    /**
     * 🟢 Login: guarda token y usuario
     */
    const login = (newToken, userData = null) => {
        try {
            localStorage.setItem("token", newToken);
            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            setToken(newToken);

            if (userData) {
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
            }
        } catch (err) {
            console.error("Error al guardar sesión:", err);
        }
    };

    /**
     * 🔴 Logout: limpia sesión
     */
    const logout = (redirect = true) => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete api.defaults.headers.common["Authorization"];
        setUser(null);
        setToken(null);

        if (redirect) window.location.href = "/login";
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
