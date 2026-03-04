/**
 * 🌳 ArbolReferidosModal.jsx
 * Modal que muestra el árbol recursivo de referidos de una membresía
 */
import React, { useEffect, useState } from "react";
import { X, Users, ChevronDown, ChevronRight, Star } from "lucide-react";
import { getArbolReferidos } from "../../services/MembresiaService";

const ESTADO_BADGE = {
    ACTIVA: "bg-green-100 text-green-700",
    INACTIVA: "bg-gray-100 text-gray-500",
    PENDIENTE: "bg-yellow-100 text-yellow-700",
};

/** Nodo recursivo colapsable del árbol */
function NodoReferido({ nodo, nivel = 0 }) {
    const [expandido, setExpandido] = useState(nivel < 2); // primeros 2 niveles abiertos
    const tieneHijos = nodo.referidos && nodo.referidos.length > 0;

    return (
        <div className={`${nivel > 0 ? "ml-6 border-l-2 border-gray-200 pl-3" : ""}`}>
            <div
                className={`flex items-center gap-2 p-2 rounded-lg my-1 hover:bg-gray-50 cursor-pointer ${nivel === 0 ? "bg-herbalife-green/5 border border-herbalife-green/20" : ""}`}
                onClick={() => tieneHijos && setExpandido(!expandido)}
            >
                {/* Toggle */}
                {tieneHijos ? (
                    expandido
                        ? <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                ) : (
                    <div className="w-4 h-4 flex-shrink-0" />
                )}

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-herbalife-green/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-herbalife-green">
                        {nodo.nombreCompleto?.charAt(0) || "?"}
                    </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{nodo.nombreCompleto}</p>
                    <p className="text-xs text-gray-500">{nodo.numeroSocio}</p>
                </div>

                {/* Puntos */}
                <div className="flex items-center gap-1 text-xs text-yellow-600 flex-shrink-0">
                    <Star className="w-3 h-3" />
                    {nodo.puntosAcumulados ?? 0}
                </div>

                {/* Estado */}
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${ESTADO_BADGE[nodo.estado] || "bg-gray-100 text-gray-600"}`}>
                    {nodo.estado}
                </span>

                {/* Hijos count */}
                {tieneHijos && (
                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs flex-shrink-0">
                        {nodo.referidos.length}
                    </span>
                )}
            </div>

            {/* Hijos recursivos */}
            {expandido && tieneHijos && (
                <div>
                    {nodo.referidos.map((hijo) => (
                        <NodoReferido key={hijo.membresiaId} nodo={hijo} nivel={nivel + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

/** Función para contar total de nodos en el árbol */
function contarNodos(nodo) {
    if (!nodo) return 0;
    return 1 + (nodo.referidos || []).reduce((acc, h) => acc + contarNodos(h), 0);
}

export default function ArbolReferidosModal({ membresiaId, nombreSocio, onClose }) {
    const [arbol, setArbol] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!membresiaId) return;
        fetchArbol();
    }, [membresiaId]);

    const fetchArbol = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getArbolReferidos(membresiaId);
            setArbol(response.data);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 500) {
                setError("El servidor tuvo un error interno al generar el árbol. Es posible que esta membresía no tenga referidos registrados o que la función no esté completamente implementada en el backend.");
            } else if (status === 403) {
                setError("No tienes permisos para ver el árbol de referidos (se requiere rol ADMIN).");
            } else if (status === 404) {
                setError("No se encontró la membresía indicada.");
            } else {
                setError("No se pudo cargar el árbol de referidos. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    const totalRed = arbol ? contarNodos(arbol) - 1 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-herbalife-green/10 rounded-lg">
                            <Users className="w-5 h-5 text-herbalife-green" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Red de Referidos</h3>
                            <p className="text-sm text-gray-500">
                                {nombreSocio}
                                {!loading && arbol && (
                                    <span className="ml-2 font-medium text-herbalife-green">
                                        · {totalRed} referido{totalRed !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {loading && (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full"></div>
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    )}
                    {!loading && !error && arbol && (
                        <NodoReferido nodo={arbol} nivel={0} />
                    )}
                    {!loading && !error && !arbol && (
                        <div className="text-center py-8 text-gray-400">Sin datos de referidos</div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <button onClick={onClose}
                        className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
