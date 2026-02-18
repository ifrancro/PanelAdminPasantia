/**
 * 📄 ClubDetail.jsx
 * Vista detallada de un club con información completa
 * Permite ver todos los datos y ejecutar acciones administrativas
 * Incluye mapa OpenStreetMap para visualizar ubicación del club
 */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Clock,
    User,
    CheckCircle,
    XCircle,
    Power,
    PowerOff
} from "lucide-react";
import Swal from "sweetalert2";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Ícono naranja personalizado para el marcador del mapa
const orangeIcon = new L.Icon({
    iconUrl: "data:image/svg+xml;base64," + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="#EA580C"/>
            <circle cx="12" cy="12" r="5" fill="white"/>
        </svg>
    `),
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
});
import {
    getClubById,
    aprobarClub,
    rechazarClub,
    activarClub,
    desactivarClub
} from "../../services/ClubService";

export default function ClubDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [club, setClub] = useState(null);
    const [loading, setLoading] = useState(true);

    // === CARGAR DATOS ===
    useEffect(() => {
        fetchClub();
    }, [id]);

    const fetchClub = async () => {
        try {
            setLoading(true);
            const response = await getClubById(id);
            setClub(response.data);
        } catch (error) {
            console.error("Error al cargar club:", error);
            Swal.fire("Error", "No se pudo cargar el club", "error");
            navigate("/clubes");
        } finally {
            setLoading(false);
        }
    };

    // === ACCIONES ===
    const handleAprobar = async () => {
        const result = await Swal.fire({
            title: "¿Aprobar club?",
            text: "El solicitante se convertirá en anfitrión.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#7CB342",
            confirmButtonText: "Sí, aprobar",
        });
        if (result.isConfirmed) {
            await aprobarClub(id);
            Swal.fire("¡Aprobado!", "El club ha sido aprobado", "success");
            fetchClub();
        }
    };

    const handleRechazar = async () => {
        const { value: motivo } = await Swal.fire({
            title: "Rechazar club",
            input: "textarea",
            inputPlaceholder: "Motivo del rechazo...",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Rechazar",
        });
        if (motivo) {
            await rechazarClub(id);
            Swal.fire("Rechazado", "El club ha sido rechazado", "info");
            fetchClub();
        }
    };

    const handleActivar = async () => {
        await activarClub(id);
        Swal.fire("Activado", "El club ha sido activado", "success");
        fetchClub();
    };

    const handleDesactivar = async () => {
        const result = await Swal.fire({
            title: "¿Desactivar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Sí, desactivar",
        });
        if (result.isConfirmed) {
            await desactivarClub(id);
            Swal.fire("Desactivado", "El club ha sido desactivado", "info");
            fetchClub();
        }
    };

    // === BADGE DE ESTADO ===
    const getEstadoBadge = (estado) => {
        const estilos = {
            PENDIENTE: "bg-yellow-100 text-yellow-700 border-yellow-300",
            ACTIVO: "bg-green-100 text-green-700 border-green-300",
            RECHAZADO: "bg-red-100 text-red-700 border-red-300",
            INACTIVO: "bg-gray-100 text-gray-700 border-gray-300",
        };
        return estilos[estado] || "bg-gray-100 text-gray-700 border-gray-300";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!club) return null;

    return (
        <div className="space-y-6">
            {/* === HEADER === */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/clubes")}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{club.nombreClub}</h1>
                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium border ${getEstadoBadge(club.estado)}`}>
                                {club.estado}
                            </span>
                        </div>
                    </div>

                    {/* Botones de acción según estado */}
                    <div className="flex gap-2">
                        {club.estado === "PENDIENTE" && (
                            <>
                                <button
                                    onClick={handleAprobar}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <CheckCircle className="w-4 h-4" />
                                    Aprobar
                                </button>
                                <button
                                    onClick={handleRechazar}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    <XCircle className="w-4 h-4" />
                                    Rechazar
                                </button>
                            </>
                        )}
                        {club.estado === "ACTIVO" && (
                            <button
                                onClick={handleDesactivar}
                                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                            >
                                <PowerOff className="w-4 h-4" />
                                Desactivar
                            </button>
                        )}
                        {club.estado === "INACTIVO" && (
                            <button
                                onClick={handleActivar}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Power className="w-4 h-4" />
                                Activar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* === INFORMACIÓN DEL CLUB === */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Datos del club */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Información del Club</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Dirección</p>
                                <p className="text-gray-800">{club.direccion || "No especificada"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Horario</p>
                                <p className="text-gray-800">{club.horario || "No especificado"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Datos del anfitrión */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Anfitrión</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-500">Nombre</p>
                                <p className="text-gray-800">{club.anfitrionNombre || "No asignado"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === MAPA DE UBICACIÓN === */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-herbalife-green" />
                    Ubicación del Club
                </h2>
                {club.lat && club.lng ? (
                    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: "300px" }}>
                        <MapContainer
                            center={[club.lat, club.lng]}
                            zoom={15}
                            scrollWheelZoom={false}
                            style={{ height: "100%", width: "100%" }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[club.lat, club.lng]} icon={orangeIcon}>
                                <Popup>
                                    <strong>{club.nombreClub}</strong>
                                    <br />
                                    {club.direccion}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-gray-400">Ubicación no disponible</p>
                    </div>
                )}
            </div>
        </div>
    );
}
