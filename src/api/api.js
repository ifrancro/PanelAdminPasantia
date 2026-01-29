import axios from "axios";
import Swal from "sweetalert2";

/**
 * 🌐 API Instance
 * Axios configurado para el backend de Herbalife Clubes
 * Backend: main-limpia (Render)
 */
const api = axios.create({
    baseURL: "https://clubs-api.onrender.com/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * 🔑 Request Interceptor
 * Agrega el token JWT a cada petición
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * 🚨 Response Interceptor
 * Maneja errores globales (401 = sesión expirada)
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            Swal.fire({
                icon: "warning",
                title: "Sesión expirada",
                text: "Por favor inicia sesión nuevamente",
                confirmButtonColor: "#7CB342",
            }).then(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login";
            });
        }
        return Promise.reject(error);
    }
);

export default api;
