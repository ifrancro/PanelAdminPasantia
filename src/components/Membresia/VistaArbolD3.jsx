/**
 * 🌳 VistaArbolD3.jsx (Ahora usando React Flow)
 * Visualización genealógica del árbol de referidos.
 * Renderiza nodos personalizados arrastrables de forma independiente.
 */
import React, { useEffect, useMemo } from "react";
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Handle,
    Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

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

// ─── Lógica para armar la red de React Flow ────────────────────────────────
function buildFlowData(nodo, rootX = 0, rootY = 0, searchTerm = "") {
    const nodes = [];
    const edges = [];
    
    const nSearch = searchTerm.toLowerCase().trim();
    
    // 1er paso: pre-calcular coincidencias y anchos de los subárboles para posicionamiento inicial
    function preProcess(n, lvl) {
        if (!n) return null;
        
        const nombreStr = (n.nombreCompleto || "").toLowerCase();
        const socioStr = (n.numeroSocio || "").toLowerCase();
        n._isMatch = nSearch ? (nombreStr.includes(nSearch) || socioStr.includes(nSearch)) : true;
        
        n._children = (n.referidos || []).map(c => preProcess(c, lvl + 1));
        n._hasMatchingChild = n._children.some(c => c._isMatch || c._hasMatchingChild);
        
        if (n._children.length === 0) {
            n._width = 280; // Espacio horizontal mínimo por hoja
        } else {
            n._width = n._children.reduce((acc, c) => acc + c._width, 0);
        }
        return n;
    }
    
    const root = preProcess(nodo, 0);
    
    // 2do paso: construir nodos y ejes de React Flow con las posiciones
    function positionNodes(n, x, y, lvl) {
        if (!n) return;
        
        nodes.push({
            id: String(n.membresiaId),
            position: { x, y },
            type: "custom",
            data: {
                name: n.nombreCompleto,
                numeroSocio: n.numeroSocio,
                puntosAcumulados: n.puntosAcumulados ?? 0,
                estado: n.estado,
                clubNombre: n.clubNombre,
                membresiaId: n.membresiaId,
                nivel: lvl,
                isMatch: n._isMatch,
                hasMatchingChild: n._hasMatchingChild,
                searchTermActive: !!nSearch
            }
        });
        
        if (n._children && n._children.length > 0) {
            let startX = x - (n._width / 2);
            n._children.forEach(c => {
                const childX = startX + (c._width / 2);
                edges.push({
                    id: `e-${n.membresiaId}-${c.membresiaId}`,
                    source: String(n.membresiaId),
                    target: String(c.membresiaId),
                    type: "smoothstep",
                    animated: false,
                    style: { stroke: "#94a3b8", strokeWidth: 1.5 }
                });
                positionNodes(c, childX, y + 160, lvl + 1); // Separación vertical de 160px
                startX += c._width;
            });
        }
    }
    
    if (root) {
        positionNodes(root, rootX, rootY, 0);
    }
    
    return { initialNodes: nodes, initialEdges: edges };
}

// ─── Componente Nodo Personalizado ─────────────────────────────────────────
const CustomNode = ({ data }) => {
    const { 
        name, numeroSocio, clubNombre, puntosAcumulados, 
        estado, nivel, isMatch, hasMatchingChild, searchTermActive 
    } = data;
    
    const esRaiz = nivel === 0;
    const borderClass = esRaiz
        ? "border-herbalife-green"
        : NIVEL_BORDER[(nivel - 1) % NIVEL_BORDER.length];

    let containerClass = `w-[240px] bg-white rounded-xl shadow-md border-2 p-3 flex flex-col justify-center cursor-grab active:cursor-grabbing transition-all duration-300 relative overflow-hidden`;
    
    if (searchTermActive) {
        if (isMatch) {
            containerClass += ` ${borderClass} ring-4 ring-herbalife-green/30 shadow-xl scale-105`;
        } else if (hasMatchingChild) {
            containerClass += ` ${borderClass} opacity-60 hover:opacity-80 grayscale-[30%]`;
        } else {
            containerClass += ` border-gray-200 opacity-30 grayscale hover:opacity-50`;
        }
    } else {
        containerClass += ` ${borderClass} hover:shadow-xl hover:scale-[1.02]`;
    }

    return (
        <div className={containerClass}>
            {/* Handle oculto arriba para que los conectores se unan al borde */}
            <Handle type="target" position={Position.Top} className="opacity-0 w-full h-1 top-0" />
            
            {/* Etiqueta de Jerarquía */}
            <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg border-l border-b border-gray-200">
                Nivel {nivel}
            </div>

            <div className="flex items-center gap-2 mt-1">
                <div
                    className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                        esRaiz
                            ? "bg-herbalife-green text-white"
                            : "bg-herbalife-green/15 text-herbalife-green"
                    }`}
                >
                    {name?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                    <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                        {name || "—"}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono truncate">
                        {numeroSocio || "-"}
                    </p>
                    {clubNombre && (
                        <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                            {clubNombre}
                        </p>
                    )}
                </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 gap-1">
                <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                        ESTADO_BADGE[estado] || "bg-gray-100 text-gray-600"
                    }`}
                >
                    {estado || "-"}
                </span>
                <span className="flex items-center gap-1 text-xs text-yellow-600 font-semibold">
                    <svg
                        className="w-3.5 h-3.5 fill-current"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.152c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.287 3.953c.3.922-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.175 0l-3.36 2.44c-.785.57-1.84-.196-1.54-1.118l1.287-3.953a1 1 0 00-.364-1.118L2.072 9.38c-.783-.57-.38-1.81.588-1.81h4.152a1 1 0 00.95-.69l1.287-3.953z" />
                    </svg>
                    {puntosAcumulados}
                </span>
            </div>
            
            {/* Handle oculto abajo */}
            <Handle type="source" position={Position.Bottom} className="opacity-0 w-full h-1 bottom-0" />
        </div>
    );
};

const nodeTypes = { custom: CustomNode };

// ─── Componente Principal ──────────────────────────────────────────────────
export default function VistaArbolD3({ arbol, searchTerm = "" }) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (arbol) {
            // Posicionamos la raíz cerca del centro superior
            const { initialNodes, initialEdges } = buildFlowData(arbol, 0, 50, searchTerm);
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [arbol, searchTerm, setNodes, setEdges]);

    return (
        <div className="relative w-full h-[65vh] bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl border border-gray-200 overflow-hidden shadow-inner">
            
            <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 text-[11px] text-gray-600 shadow-sm pointer-events-none">
                <p className="font-bold text-gray-800 mb-1">Mapa Interactivo Independiente</p>
                <p>• <b>Arrastrar cuadros:</b> Los moverá de forma independiente.</p>
                <p>• <b>Arrastrar fondo:</b> Moverá todo el lienzo.</p>
                <p>• <b>Scroll:</b> Para hacer zoom In/Out.</p>
            </div>

            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.3 }}
                minZoom={0.1}
                maxZoom={1.5}
                attributionPosition="bottom-right"
            >
                <Background color="#ccc" gap={16} size={1} />
                <Controls showInteractive={false} />
                <MiniMap 
                    nodeColor={(n) => {
                        return n.data.nivel === 0 ? '#1B5E20' : '#E2E8F0';
                    }} 
                    maskColor="rgba(240, 240, 240, 0.6)"
                    className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                />
            </ReactFlow>
        </div>
    );
}
