import axios from "axios";
import Swal from "sweetalert2";
import {
    isAuthLoginRequest,
    isOnLoginPage,
    shouldHandleSessionExpired,
    stripAuthorizationHeader,
} from "./authGuards";

/**
 * 🌐 API Instance
 * Axios configurado para el backend de Herbalife Clubes
 * Backend: main-limpia (Render)
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://clubs-api.onrender.com/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * 🔑 Request Interceptor
 * Bearer en endpoints autenticados. Nunca en POST /auth/login.
 */
api.interceptors.request.use((config) => {
    if (isAuthLoginRequest(config)) {
        stripAuthorizationHeader(config);
        return config;
    }

    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * 🚨 Response Interceptor
 * 401 de /auth/login → credenciales (lo maneja LoginPage).
 * 401 autenticado → sesión expirada, salvo request stale o loop en /login.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (shouldHandleSessionExpired(error)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (!isOnLoginPage()) {
                Swal.fire({
                    icon: "warning",
                    title: "Sesión expirada",
                    text: "Por favor inicia sesión nuevamente",
                    confirmButtonColor: "#1B5E20",
                }).then(() => {
                    window.location.href = "/login";
                });
            }
        }
        return Promise.reject(error);
    }
);

export default api;
