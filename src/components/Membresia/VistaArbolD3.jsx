/**
 * 🌳 VistaArbolD3.jsx
 * Visualización genealógica del árbol de referidos usando react-d3-tree.
 * Renderiza nodos SVG personalizados (tarjeta con avatar, N° socio, puntos, estado)
 * con conectores curvos tipo Bézier y controles de zoom / orientación.
 */
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import Tree from "react-d3-tree";
import { Maximize2, RotateCw, Star } from "lucide-react";

const ESTADO_BADGE = {
    ACTIVA: "bg-green-100 text-green-700",
    INACTIVA: "bg-gray-100 text-gray-500",
    PENDIENTE: "bg-yellow-100 text-yellow-700",
};

const NIVEL_BORDER = [
    "border-indigo-400",
    "border-purple-400",
    "border-pink-400",
    "border-orange-400",
    "border-teal-400",
];

const NODE_W = 230;
const NODE_H = 112;

function toD3TreeData(nodo, nivel = 0) {
    if (!nodo) return null;
    return {
        name: nodo.nombreCompleto || "—",
        attributes: {
            numeroSocio: nodo.numeroSocio || "",
            puntosAcumulados: nodo.puntosAcumulados ?? 0,
            estado: nodo.estado || "",
            membresiaId: nodo.membresiaId,
            clubNombre: nodo.clubNombre || "",
            nivel,
        },
        children: (nodo.referidos || []).map((h) => toD3TreeData(h, nivel + 1)),
    };
}

function CustomNode({ nodeDatum, toggleNode, onSelect }) {
    const nivel = nodeDatum.attributes?.nivel ?? 0;
    const estado = nodeDatum.attributes?.estado || "";
    const esRaiz = nivel === 0;
    const tieneHijos = nodeDatum.children && nodeDatum.children.length > 0;
    const colapsado = nodeDatum.__rd3t?.collapsed;
    const borderClass = esRaiz
        ? "border-herbalife-green"
        : NIVEL_BORDER[(nivel - 1) % NIVEL_BORDER.length];

    return (
        <foreignObject
            x={-NODE_W / 2}
            y={-NODE_H / 2}
            width={NODE_W}
            height={NODE_H}
            style={{ overflow: "visible" }}
        >
            <div
                xmlns="http://www.w3.org/1999/xhtml"
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(nodeDatum);
                }}
                onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (tieneHijos) toggleNode();
                }}
                className={`w-full h-full bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-150 border-2 ${borderClass} p-2.5 flex flex-col justify-center cursor-pointer hover:scale-[1.02]`}
                title={`${nodeDatum.name} · ${nodeDatum.attributes?.numeroSocio}`}
            >
                <div className="flex items-center gap-2">
                    <div
                        className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                            esRaiz
                                ? "bg-herbalife-green text-white"
                                : "bg-herbalife-green/15 text-herbalife-green"
                        }`}
                    >
                        {nodeDatum.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                            {nodeDatum.name}
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono truncate">
                            {nodeDatum.attributes?.numeroSocio}
                        </p>
                        {nodeDatum.attributes?.clubNombre && (
                            <p className="text-[10px] text-gray-400 truncate leading-tight">
                                {nodeDatum.attributes.clubNombre}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between mt-1.5 gap-1">
                    <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                            ESTADO_BADGE[estado] || "bg-gray-100 text-gray-600"
                        }`}
                    >
                        {estado}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-yellow-600 font-semibold">
                        <svg
                            className="w-3 h-3 fill-current"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.152c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.953c.3.922-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.785.57-1.84-.196-1.54-1.118l1.287-3.953a1 1 0 00-.364-1.118L2.072 9.38c-.783-.57-.38-1.81.588-1.81h4.152a1 1 0 00.95-.69l1.287-3.953z" />
                        </svg>
                        {nodeDatum.attributes?.puntosAcumulados}
                    </span>
                    {tieneHijos && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNode();
                            }}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-bold min-w-[26px]"
                            title={colapsado ? "Expandir" : "Colapsar"}
                        >
                            {colapsado ? `+${nodeDatum.children.length}` : "−"}
                        </button>
                    )}
                </div>
            </div>
        </foreignObject>
    );
}

export default function VistaArbolD3({ arbol, onNodoClick }) {
    const containerRef = useRef(null);
    const [translate, setTranslate] = useState({ x: 0, y: 0 });
    const [orientation, setOrientation] = useState("vertical");
    const [fitTick, setFitTick] = useState(0);

    const data = useMemo(() => toD3TreeData(arbol), [arbol]);

    const centrar = useCallback(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (orientation === "vertical") {
            setTranslate({ x: rect.width / 2, y: NODE_H });
        } else {
            setTranslate({ x: NODE_W / 2 + 40, y: rect.height / 2 });
        }
    }, [orientation]);

    useEffect(() => {
        centrar();
    }, [centrar, fitTick]);

    useEffect(() => {
        const handler = () => centrar();
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, [centrar]);

    if (!arbol) return null;

    return (
        <div className="relative w-full h-[65vh] bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200 overflow-hidden">
            <div className="absolute top-3 right-3 z-10 flex gap-2">
                <button
                    onClick={() =>
                        setOrientation((o) => (o === "vertical" ? "horizontal" : "vertical"))
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 shadow-sm"
                    title="Cambiar orientación"
                >
                    <RotateCw className="w-3.5 h-3.5" />
                    {orientation === "vertical" ? "Horizontal" : "Vertical"}
                </button>
                <button
                    onClick={() => setFitTick((t) => t + 1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 shadow-sm"
                    title="Centrar árbol"
                >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Centrar
                </button>
            </div>

            <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-600 shadow-sm">
                <p className="font-semibold text-gray-700 mb-1">Controles</p>
                <p>• Scroll: zoom · Arrastrar: mover</p>
                <p>• Doble click en nodo: expandir/colapsar</p>
            </div>

            <div ref={containerRef} className="w-full h-full">
                {data && (
                    <Tree
                        data={data}
                        translate={translate}
                        orientation={orientation}
                        pathFunc="diagonal"
                        nodeSize={
                            orientation === "vertical"
                                ? { x: NODE_W + 30, y: NODE_H + 70 }
                                : { x: NODE_W + 90, y: NODE_H + 25 }
                        }
                        separation={{ siblings: 1, nonSiblings: 1.25 }}
                        zoom={0.85}
                        scaleExtent={{ min: 0.2, max: 2 }}
                        initialDepth={2}
                        renderCustomNodeElement={(rd3tProps) => (
                            <CustomNode {...rd3tProps} onSelect={onNodoClick} />
                        )}
                        pathClassFunc={() => "rd3t-link-herbalife"}
                    />
                )}
            </div>

            <style>{`
                .rd3t-link-herbalife {
                    stroke: #94a3b8;
                    stroke-width: 1.5;
                    fill: none;
                }
                .rd3t-tree-container {
                    width: 100%;
                    height: 100%;
                }
            `}</style>
        </div>
    );
}
