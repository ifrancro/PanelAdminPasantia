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

            // 🔒 Validar que el usuario sea ADMIN o ANFITRION
            const userRole = userData.rol?.nombre?.toUpperCase();
            if (userRole !== "ADMIN" && userRole !== "ANFITRION") {
                // Limpiar token si no es autorizado
                delete api.defaults.headers.common["Authorization"];

                Swal.fire({
                    icon: "error",
                    title: "Acceso denegado",
                    text: "Este panel es exclusivo para administradores y anfitriones",
                    confirmButtonColor: "#1B5E20",
                });
                setLoading(false);
                return;
            }

            login(token, userData);

            Swal.fire({
                icon: "success",
                title: "¡Bienvenido!",
                text: `Hola ${userData.nombre || "Administrador"}`,
                confirmButtonColor: "#1B5E20",
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
                confirmButtonColor: "#1B5E20",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            {/* Overlay sutil para oscurecer la imagen y que resalte la tarjeta */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Header NutriClub */}
            <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center bg-white/30 backdrop-blur-md border-b border-white/20">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">NutriClub</h1>
            </div>

            {/* Card de Login */}
            <div className="relative z-10 w-full max-w-[560px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-12 md:p-16 transform transition-all duration-300">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-800 mb-4">Bienvenido de nuevo</h2>
                    <p className="text-lg text-gray-500 font-medium">Inicia sesión en tu panel de administración.</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campo Email */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            placeholder="tucorreo@ejemplo.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                            }}
                            className={`w-full px-6 py-4 border rounded-xl focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] outline-none transition-all duration-200 text-gray-700 text-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-2 font-medium">{errors.email}</p>
                        )}
                    </div>

                    {/* Campo Contraseña */}
                    <div className="pt-4">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                            }}
                            className={`w-full px-6 py-4 border rounded-xl focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] outline-none transition-all duration-200 text-gray-700 text-lg tracking-widest ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-2 font-medium">{errors.password}</p>
                        )}
                    </div>

                    {/* Botón Ingresar */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 mt-8 bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-lg font-bold rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Iniciando...</span>
                            </div>
                        ) : (
                            "Iniciar Sesión"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
