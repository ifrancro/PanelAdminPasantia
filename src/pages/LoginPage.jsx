import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import Swal from "sweetalert2";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

/**
 * 🔐 LoginPage
 * Pantalla de inicio de sesión con estilo Herbalife
 */
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const [errors, setErrors] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar formulario
        let valid = true;
        const errorsCopy = { ...errors };

        // Email - requerido y formato válido
        if (!email.trim()) {
            errorsCopy.email = "El correo es requerido";
            valid = false;
        } else {
            const emailRegex = /^(?=.{6,254}$)(?=.{1,64}@)[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
            if (!emailRegex.test(email.trim())) {
                errorsCopy.email = "Formato de correo inválido";
                valid = false;
            } else {
                errorsCopy.email = "";
            }
        }

        // Password - requerido y longitud mínima
        if (!password.trim()) {
            errorsCopy.password = "La contraseña es requerida";
            valid = false;
        } else if (password.trim().length < 6) {
            errorsCopy.password = "La contraseña debe tener al menos 6 caracteres";
            valid = false;
        } else {
            errorsCopy.password = "";
        }

        setErrors(errorsCopy);
        if (!valid) {
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email: email.trim(),
                password: password.trim(),
            });

            const { token } = response.data;

            // Obtener datos del usuario
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const userResponse = await api.get("/auth/me");
            const userData = userResponse.data;

            // 🔒 Validar que el usuario sea ADMIN
            const userRole = userData.rol?.nombre?.toUpperCase();
            if (userRole !== "ADMIN") {
                // Limpiar token si no es admin
                delete api.defaults.headers.common["Authorization"];

                Swal.fire({
                    icon: "error",
                    title: "Acceso denegado",
                    text: "Este panel es exclusivo para administradores",
                    confirmButtonColor: "#7CB342",
                });
                setLoading(false);
                return;
            }

            login(token, userData);

            Swal.fire({
                icon: "success",
                title: "¡Bienvenido!",
                text: `Hola ${userData.nombre || "Administrador"}`,
                confirmButtonColor: "#7CB342",
                timer: 1500,
                showConfirmButton: false,
            });

            navigate("/");
        } catch (error) {
            console.error("Error de login:", error);

            // Manejo específico de errores según código HTTP
            let errorTitle = "Error de autenticación";
            let errorMessage = "Ha ocurrido un error inesperado";

            if (error.response) {
                // El servidor respondió con un código de error
                const status = error.response.status;
                const backendMessage = error.response.data?.message;

                switch (status) {
                    case 401:
                        // Credenciales incorrectas
                        errorTitle = "Credenciales incorrectas";
                        errorMessage = backendMessage || "El correo o la contraseña son incorrectos. Por favor, verifica tus datos.";
                        // Mostrar error en el campo de contraseña
                        setErrors(prev => ({
                            ...prev,
                            password: "Correo o contraseña incorrectos"
                        }));
                        break;
                    case 403:
                        // Acceso prohibido
                        errorTitle = "Acceso prohibido";
                        errorMessage = backendMessage || "No tienes permisos para acceder a este panel.";
                        break;
                    case 404:
                        // Usuario no encontrado
                        errorTitle = "Usuario no encontrado";
                        errorMessage = "No existe una cuenta con ese correo electrónico.";
                        break;
                    case 500:
                        // Error del servidor
                        errorTitle = "Error del servidor";
                        errorMessage = "Ocurrió un problema en el servidor. Por favor, intenta más tarde.";
                        break;
                    default:
                        errorMessage = backendMessage || "Error en la autenticación. Por favor, intenta nuevamente.";
                }
            } else if (error.request) {
                // No se recibió respuesta del servidor
                errorTitle = "Error de conexión";
                errorMessage = "No se pudo conectar con el servidor. Verifica tu conexión a internet.";
            }

            Swal.fire({
                icon: "error",
                title: errorTitle,
                text: errorMessage,
                confirmButtonColor: "#7CB342",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-herbalife-green to-herbalife-dark p-4">
            {/* Card de Login */}
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:scale-[1.02]">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-herbalife-green to-herbalife-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <LogIn className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
                    <p className="text-gray-500 mt-2">Inicia sesión en tu cuenta</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo Email */}
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                placeholder="Correo Electrónico"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                                }}
                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:border-herbalife-green focus:ring-2 focus:ring-herbalife-green/20 outline-none transition-all duration-200 text-gray-700 ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Campo Contraseña */}
                    <div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                                }}
                                className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:border-herbalife-green focus:ring-2 focus:ring-herbalife-green/20 outline-none transition-all duration-200 text-gray-700 ${errors.password ? 'border-red-500' : 'border-gray-200'}`}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Botón Ingresar */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-herbalife-green to-herbalife-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Ingresando...</span>
                            </div>
                        ) : (
                            "INGRESAR"
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                        Panel Administrativo Herbalife Clubes
                    </p>
                </div>
            </div>
        </div>
    );
}
