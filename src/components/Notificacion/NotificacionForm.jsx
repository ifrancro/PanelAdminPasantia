/**
 * 🔔 NotificacionForm.jsx
 * Formulario para enviar notificaciones masivas
 * Soporta envío global o segmentado (por hub/club)
 */
import React, { useState, useEffect } from "react";
import { Send, Users, Building2, Store } from "lucide-react";
import Swal from "sweetalert2";
import { enviarNotificacion } from "../../services/NotificacionService";
import { getAllHubs } from "../../services/HubService";
import { getAllClubes } from "../../services/ClubService";

export default function NotificacionForm() {
    const [formData, setFormData] = useState({
        titulo: "",
        mensaje: "",
        tipoEnvio: "GLOBAL", // GLOBAL, HUB, CLUB
        hubId: "",
        clubId: "",
    });
    const [loading, setLoading] = useState(false);
    const [hubs, setHubs] = useState([]);
    const [clubes, setClubes] = useState([]);

    useEffect(() => {
        fetchHubsYClubes();
    }, []);

    const fetchHubsYClubes = async () => {
        try {
            const [hubsRes, clubesRes] = await Promise.all([
                getAllHubs(),
                getAllClubes(),
            ]);
            setHubs(hubsRes.data);
            setClubes(clubesRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.titulo.trim() || !formData.mensaje.trim()) {
            Swal.fire("Validación", "Título y mensaje son requeridos", "warning");
            return;
        }

        // Validar selección según tipo de envío
        if (formData.tipoEnvio === "HUB" && !formData.hubId) {
            Swal.fire("Validación", "Selecciona un hub", "warning");
            return;
        }
        if (formData.tipoEnvio === "CLUB" && !formData.clubId) {
            Swal.fire("Validación", "Selecciona un club", "warning");
            return;
        }

        setLoading(true);
        try {
            const notificacion = {
                titulo: formData.titulo,
                mensaje: formData.mensaje,
            };

            // Determinar parámetros de segmentación
            const hubId = formData.tipoEnvio === "HUB" ? parseInt(formData.hubId) : null;
            const clubId = formData.tipoEnvio === "CLUB" ? parseInt(formData.clubId) : null;

            await enviarNotificacion(notificacion, hubId, clubId);

            const tipoTexto =
                formData.tipoEnvio === "GLOBAL" ? "todos los usuarios" :
                    formData.tipoEnvio === "HUB" ? "usuarios del hub" :
                        "usuarios del club";

            Swal.fire("Enviada", `Notificación enviada a ${tipoTexto}`, "success");

            // Limpiar formulario
            setFormData({
                titulo: "",
                mensaje: "",
                tipoEnvio: "GLOBAL",
                hubId: "",
                clubId: "",
            });
        } catch (error) {
            console.error("Error:", error);
            Swal.fire("Error", "No se pudo enviar la notificación", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-3xl mx-auto">
            <div className="p-6 bg-gradient-to-r from-herbalife-green to-herbalife-dark">
                <div className="flex items-center gap-3 text-white">
                    <Send className="w-6 h-6" />
                    <div>
                        <h2 className="text-xl font-semibold">Enviar Notificación</h2>
                        <p className="text-sm opacity-90">Comunicación masiva con usuarios</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Tipo de envío */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Tipo de Envío
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, tipoEnvio: "GLOBAL", hubId: "", clubId: "" }))}
                            className={`p-4 border-2 rounded-lg transition-all ${formData.tipoEnvio === "GLOBAL"
                                    ? "border-herbalife-green bg-herbalife-green/10"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <Users className={`w-6 h-6 mx-auto mb-2 ${formData.tipoEnvio === "GLOBAL" ? "text-herbalife-green" : "text-gray-400"
                                }`} />
                            <p className={`text-sm font-medium ${formData.tipoEnvio === "GLOBAL" ? "text-herbalife-green" : "text-gray-600"
                                }`}>
                                Global
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Todos</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, tipoEnvio: "HUB", clubId: "" }))}
                            className={`p-4 border-2 rounded-lg transition-all ${formData.tipoEnvio === "HUB"
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <Building2 className={`w-6 h-6 mx-auto mb-2 ${formData.tipoEnvio === "HUB" ? "text-blue-600" : "text-gray-400"
                                }`} />
                            <p className={`text-sm font-medium ${formData.tipoEnvio === "HUB" ? "text-blue-600" : "text-gray-600"
                                }`}>
                                Por Hub
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Regional</p>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, tipoEnvio: "CLUB", hubId: "" }))}
                            className={`p-4 border-2 rounded-lg transition-all ${formData.tipoEnvio === "CLUB"
                                    ? "border-orange-500 bg-orange-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <Store className={`w-6 h-6 mx-auto mb-2 ${formData.tipoEnvio === "CLUB" ? "text-orange-600" : "text-gray-400"
                                }`} />
                            <p className={`text-sm font-medium ${formData.tipoEnvio === "CLUB" ? "text-orange-600" : "text-gray-600"
                                }`}>
                                Por Club
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Específico</p>
                        </button>
                    </div>
                </div>

                {/* Selección de Hub/Club según tipo */}
                {formData.tipoEnvio === "HUB" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Hub
                        </label>
                        <select
                            name="hubId"
                            value={formData.hubId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Seleccionar...</option>
                            {hubs.map(hub => (
                                <option key={hub.id} value={hub.id}>{hub.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}

                {formData.tipoEnvio === "CLUB" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar Club
                        </label>
                        <select
                            name="clubId"
                            value={formData.clubId}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="">Seleccionar...</option>
                            {clubes.map(club => (
                                <option key={club.id} value={club.id}>{club.nombre}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Título */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título *
                    </label>
                    <input
                        type="text"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleChange}
                        placeholder="Ej: Nuevo evento disponible"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none"
                    />
                </div>

                {/* Mensaje */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje *
                    </label>
                    <textarea
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        rows="5"
                        placeholder="Escribe el contenido de la notificación..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none resize-none"
                    />
                </div>

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-herbalife-green text-white rounded-lg hover:bg-herbalife-dark disabled:opacity-50 font-medium text-lg"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                    {loading ? "Enviando..." : "Enviar Notificación"}
                </button>
            </form>
        </div>
    );
}
