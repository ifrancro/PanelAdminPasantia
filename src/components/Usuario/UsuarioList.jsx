/**
 * 👥 UsuarioList.jsx
 * Lista de todos los usuarios registrados (solo lectura para admin)
 */
import React, { useEffect, useState } from "react";
import { Users, Eye, UserX, Mail, Phone } from "lucide-react";
import Swal from "sweetalert2";
import { getAllUsuarios, desactivarUsuario } from "../../services/UsuarioService";

export default function UsuarioList() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroRol, setFiltroRol] = useState("TODOS");

    useEffect(() => {
        fetchUsuarios();
    }, []);

    const fetchUsuarios = async () => {
        try {
            setLoading(true);
            const response = await getAllUsuarios();
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            Swal.fire("Error", "No se pudieron cargar los usuarios", "error");
        } finally {
            setLoading(false);
        }
    };

    // Filtrar usuarios
    const usuariosFiltrados = usuarios.filter(usuario => {
        if (filtroRol === "TODOS") return true;
        return usuario.rolNombre === filtroRol;
    });

    // Contar por rol
    const contarPorRol = (rol) =>
        usuarios.filter(u => u.rolNombre === rol).length;

    // Desactivar usuario
    const handleDesactivar = async (id, nombre) => {
        const result = await Swal.fire({
            title: "¿Desactivar usuario?",
            text: `${nombre} no podrá acceder al sistema`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc2626",
            confirmButtonText: "Sí, desactivar",
        });

        if (result.isConfirmed) {
            try {
                await desactivarUsuario(id);
                Swal.fire("Desactivado", "Usuario desactivado", "info");
                fetchUsuarios();
            } catch (error) {
                Swal.fire("Error", "No se pudo desactivar", "error");
            }
        }
    };

    // Badge de rol
    const getRolBadge = (rol) => {
        const estilos = {
            ADMIN: "bg-red-100 text-red-700",
            ANFITRION: "bg-blue-100 text-blue-700",
            SOCIO: "bg-green-100 text-green-700",
        };
        return estilos[rol] || "bg-gray-100 text-gray-700";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con filtros */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Usuarios</h2>
                            <p className="text-sm text-gray-500">{usuarios.length} usuarios registrados</p>
                        </div>
                    </div>

                    {/* Filtro por rol */}
                    <select
                        value={filtroRol}
                        onChange={(e) => setFiltroRol(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green outline-none"
                    >
                        <option value="TODOS">Todos ({usuarios.length})</option>
                        <option value="ADMIN">Admins ({contarPorRol("ADMIN")})</option>
                        <option value="ANFITRION">Anfitriones ({contarPorRol("ANFITRION")})</option>
                        <option value="SOCIO">Socios ({contarPorRol("SOCIO")})</option>
                    </select>
                </div>
            </div>

            {/* Tabla de usuarios */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {usuariosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No hay usuarios con el filtro seleccionado
                                    </td>
                                </tr>
                            ) : (
                                usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {usuario.nombre} {usuario.apellido}
                                                </p>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <Mail className="w-3 h-3" />
                                                    {usuario.email}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {usuario.telefono ? (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {usuario.telefono}
                                                </div>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRolBadge(usuario.rolNombre)}`}>
                                                {usuario.rolNombre || "Sin rol"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${usuario.estado === "ACTIVO"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {usuario.estado || "ACTIVO"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end gap-2">
                                                {usuario.estado === "ACTIVO" && usuario.rolNombre !== "ADMIN" && (
                                                    <button
                                                        onClick={() => handleDesactivar(usuario.id, `${usuario.nombre} ${usuario.apellido}`)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Desactivar"
                                                    >
                                                        <UserX className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
