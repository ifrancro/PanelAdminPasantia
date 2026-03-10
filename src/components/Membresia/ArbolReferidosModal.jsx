/**
 * 🌳 ArbolReferidosModal.jsx
 * Modal con dos vistas de la red de referidos:
 *   - Vista Árbol: colapsable, jerárquica
 *   - Vista Lista: tabla plana (BFS) con filtro numérico de líneas
 */
import React, { useEffect, useState, useMemo } from "react";
import { X, Users, ChevronDown, ChevronRight, Star, List, GitFork, Filter } from "lucide-react";
import { getArbolReferidos } from "../../services/MembresiaService";

// ─── Constantes ────────────────────────────────────────────────────────────

const ESTADO_BADGE = {
    ACTIVA: "bg-green-100 text-green-700",
    INACTIVA: "bg-gray-100 text-gray-500",
    PENDIENTE: "bg-yellow-100 text-yellow-700",
};

const NIVEL_COLOR = [
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
    "bg-pink-100 text-pink-700",
    "bg-orange-100 text-orange-700",
    "bg-teal-100 text-teal-700",
];

// ─── Utilidades ────────────────────────────────────────────────────────────

/** Cuenta total de nodos (excluyendo la raíz) */
function contarNodos(nodo) {
    if (!nodo) return 0;
    return 1 + (nodo.referidos || []).reduce((acc, h) => acc + contarNodos(h), 0);
}

/**
 * Aplana el árbol en una lista ordenada por nivel (BFS)
 * Excluye el nodo raíz (nivel 0) — solo referidos
 * @returns Array de { nodo, nivel, posicion }
 */
function aplanarArbolBFS(raiz) {
    if (!raiz) return [];
    const resultado = [];
    const cola = (raiz.referidos || []).map(n => ({ nodo: n, nivel: 1 }));
    let pos = 1;

    while (cola.length > 0) {
        const { nodo, nivel } = cola.shift();
        resultado.push({ nodo, nivel, posicion: pos++ });
        (nodo.referidos || []).forEach(hijo => {
            cola.push({ nodo: hijo, nivel: nivel + 1 });
        });
    }
    return resultado;
}

// ─── Vista Árbol ───────────────────────────────────────────────────────────

function NodoReferido({ nodo, nivel = 0 }) {
    const [expandido, setExpandido] = useState(nivel < 2);
    const tieneHijos = nodo.referidos && nodo.referidos.length > 0;

    return (
        <div className={nivel > 0 ? "ml-5 border-l-2 border-gray-200 pl-3" : ""}>
            <div
                className={`flex items-center gap-2 p-2 rounded-lg my-1 transition-colors
                    ${tieneHijos ? "cursor-pointer" : ""}
                    ${nivel === 0 ? "bg-herbalife-green/5 border border-herbalife-green/20" : "hover:bg-gray-50"}`}
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

                {/* Count hijos */}
                {tieneHijos && (
                    <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs flex-shrink-0">
                        {nodo.referidos.length}
                    </span>
                )}
            </div>

            {expandido && tieneHijos && (
                <div>
                    {nodo.referidos.map(hijo => (
                        <NodoReferido key={hijo.membresiaId} nodo={hijo} nivel={nivel + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Vista Lista ───────────────────────────────────────────────────────────

function VistaLista({ listaPlana, totalRed }) {
    const [limite, setLimite] = useState(totalRed > 0 ? Math.min(totalRed, 10) : 10);
    const [inputVal, setInputVal] = useState(String(Math.min(totalRed, 10)));

    const listaFiltrada = useMemo(
        () => listaPlana.slice(0, Math.max(1, Number(limite) || totalRed)),
        [listaPlana, limite]
    );

    const handleLimiteChange = (e) => {
        const val = e.target.value;
        setInputVal(val);
        const n = parseInt(val, 10);
        if (!isNaN(n) && n > 0) setLimite(n);
    };

    if (totalRed === 0) {
        return (
            <div className="text-center py-8 text-gray-400 text-sm">
                Este socio no tiene referidos en su red.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Control de filtro */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 flex-shrink-0">Mostrar</span>
                <input
                    type="number"
                    min="1"
                    max={totalRed}
                    value={inputVal}
                    onChange={handleLimiteChange}
                    className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm text-center font-bold focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none"
                />
                <span className="text-sm text-gray-600">
                    de <span className="font-semibold text-gray-800">{totalRed}</span> líneas de red
                </span>
                {/* Accesos rápidos */}
                <div className="ml-auto flex gap-1">
                    {[10, 25, 50].filter(n => n < totalRed).map(n => (
                        <button
                            key={n}
                            onClick={() => { setLimite(n); setInputVal(String(n)); }}
                            className={`px-2 py-1 text-xs rounded ${limite === n ? "bg-herbalife-green text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        onClick={() => { setLimite(totalRed); setInputVal(String(totalRed)); }}
                        className={`px-2 py-1 text-xs rounded ${limite >= totalRed ? "bg-herbalife-green text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-100"}`}
                    >
                        Todos
                    </button>
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nivel red</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">N° Socio</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Puntos</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {listaFiltrada.map(({ nodo, nivel, posicion }) => (
                            <tr key={nodo.membresiaId} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs text-gray-400 font-mono">{posicion}</td>
                                <td className="px-3 py-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${NIVEL_COLOR[(nivel - 1) % NIVEL_COLOR.length]}`}>
                                        Línea {nivel}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600 font-mono">{nodo.numeroSocio || "-"}</td>
                                <td className="px-3 py-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-herbalife-green/15 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-herbalife-green">
                                                {nodo.nombreCompleto?.charAt(0) || "?"}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{nodo.nombreCompleto}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[nodo.estado] || "bg-gray-100 text-gray-600"}`}>
                                        {nodo.estado}
                                    </span>
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <div className="flex items-center justify-end gap-1 text-yellow-600">
                                        <Star className="w-3 h-3" />
                                        <span className="text-xs font-semibold">{nodo.puntosAcumulados ?? 0}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-gray-400 text-center">
                Mostrando {listaFiltrada.length} de {totalRed} líneas · ordenadas por nivel (BFS)
            </p>
        </div>
    );
}

// ─── Modal principal ───────────────────────────────────────────────────────

export default function ArbolReferidosModal({ membresiaId, nombreSocio, onClose }) {
    const [arbol, setArbol] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("arbol"); // "arbol" | "lista"

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
                setError("Error interno del servidor. Puede que esta membresía no tenga referidos.");
            } else if (status === 403) {
                setError("Sin permisos para ver el árbol de referidos (se requiere rol ADMIN).");
            } else if (status === 404) {
                setError("Membresía no encontrada.");
            } else {
                setError("No se pudo cargar la red de referidos. Intenta de nuevo.");
            }
        } finally {
            setLoading(false);
        }
    };

    const totalRed = arbol ? contarNodos(arbol) - 1 : 0;
    const listaPlana = useMemo(() => arbol ? aplanarArbolBFS(arbol) : [], [arbol]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-herbalife-green/10 rounded-lg">
                            <Users className="w-5 h-5 text-herbalife-green" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Red de Referidos</h3>
                            <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-700">{nombreSocio}</span>
                                {!loading && arbol && (
                                    <span className="ml-2 px-2 py-0.5 bg-herbalife-green/10 text-herbalife-green rounded-full text-xs font-medium">
                                        {totalRed} persona{totalRed !== 1 ? "s" : ""} en red
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs (solo si hay datos) */}
                {!loading && !error && arbol && (
                    <div className="flex border-b border-gray-200 px-5">
                        <button
                            onClick={() => setTab("arbol")}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                                ${tab === "arbol"
                                    ? "border-herbalife-green text-herbalife-green"
                                    : "border-transparent text-gray-500 hover:text-gray-700"}`}
                        >
                            <GitFork className="w-4 h-4" />
                            Vista Árbol
                        </button>
                        <button
                            onClick={() => setTab("lista")}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                                ${tab === "lista"
                                    ? "border-herbalife-green text-herbalife-green"
                                    : "border-transparent text-gray-500 hover:text-gray-700"}`}
                        >
                            <List className="w-4 h-4" />
                            Vista Lista
                            {totalRed > 0 && (
                                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                                    {totalRed}
                                </span>
                            )}
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5">
                    {loading && (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin h-8 w-8 border-4 border-herbalife-green border-t-transparent rounded-full" />
                        </div>
                    )}
                    {error && (
                        <div className="text-center py-8 text-red-500 text-sm">{error}</div>
                    )}
                    {!loading && !error && arbol && tab === "arbol" && (
                        <NodoReferido nodo={arbol} nivel={0} />
                    )}
                    {!loading && !error && arbol && tab === "lista" && (
                        <VistaLista listaPlana={listaPlana} totalRed={totalRed} />
                    )}
                    {!loading && !error && !arbol && (
                        <div className="text-center py-8 text-gray-400">Sin datos de referidos</div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
