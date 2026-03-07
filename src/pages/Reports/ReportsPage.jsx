/**
 * 📊 ReportsPage.jsx
 * Página de reportes con generación de PDF — filtros por Club y Fecha
 */
import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, Calendar, Building2, X } from 'lucide-react';
import { getAllClubes } from '../../services/ClubService';
import {
    generateMembresiaReport,
    generateAsistenciasReport
} from '../../services/reportService';
import Swal from 'sweetalert2';

export default function ReportsPage() {
    const [clubes, setClubes] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [selectedFecha, setSelectedFecha] = useState('');
    const [loading, setLoading] = useState({ membresias: false, asistencias: false });

    // Fecha de hoy en formato YYYY-MM-DD para el default máximo del date input
    const hoy = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchClubes();
    }, []);

    const fetchClubes = async () => {
        try {
            const response = await getAllClubes();
            setClubes(response.data.filter(c => c.estado === 'ACTIVO'));
        } catch {
            console.error('Error al cargar clubes');
        }
    };

    // Nombre del club seleccionado para incluirlo en el PDF
    const nombreClubSeleccionado = clubes.find(c => String(c.id) === String(selectedClubId))?.nombreClub || null;

    const handleDownload = async (tipo) => {
        const clubId = selectedClubId || null;
        const fecha = selectedFecha || null;

        try {
            setLoading(prev => ({ ...prev, [tipo]: true }));

            if (tipo === 'membresias') {
                await generateMembresiaReport(clubId, fecha, nombreClubSeleccionado);
            } else if (tipo === 'asistencias') {
                await generateAsistenciasReport(clubId, fecha, nombreClubSeleccionado);
            }

            Swal.fire({
                icon: 'success',
                title: '¡Reporte descargado!',
                text: 'El PDF se generó correctamente.',
                confirmButtonColor: '#7CB342',
                timer: 2500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error al generar PDF',
                text: error.message || 'Intenta de nuevo.',
                confirmButtonColor: '#7CB342',
            });
        } finally {
            setLoading(prev => ({ ...prev, [tipo]: false }));
        }
    };

    const limpiarFiltros = () => {
        setSelectedClubId('');
        setSelectedFecha('');
    };

    const hayFiltros = selectedClubId || selectedFecha;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
                        <p className="text-sm text-gray-500">
                            Genera PDFs filtrados por club y/o fecha
                        </p>
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Filtro Club */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            Filtrar por Club
                            <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <select
                            value={selectedClubId}
                            onChange={e => setSelectedClubId(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none text-sm bg-white"
                        >
                            <option value="">Todos los clubes</option>
                            {clubes.map(club => (
                                <option key={club.id} value={club.id}>
                                    {club.nombreClub}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro Fecha */}
                    <div>
                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            Filtrar por Fecha
                            <span className="text-gray-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="date"
                            value={selectedFecha}
                            onChange={e => setSelectedFecha(e.target.value)}
                            max={hoy}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-herbalife-green focus:border-herbalife-green outline-none text-sm"
                        />
                    </div>
                </div>

                {/* Resumen de filtros activos + botón limpiar */}
                {hayFiltros && (
                    <div className="mt-4 flex items-center gap-3 flex-wrap">
                        <p className="text-sm text-gray-600 font-medium">Filtros activos:</p>
                        {selectedClubId && (
                            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                🏢 {nombreClubSeleccionado}
                            </span>
                        )}
                        {selectedFecha && (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                📅 {new Date(selectedFecha + 'T00:00:00').toLocaleDateString('es-ES', {
                                    day: '2-digit', month: 'long', year: 'numeric'
                                })}
                            </span>
                        )}
                        <button
                            onClick={limpiarFiltros}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 ml-auto"
                        >
                            <X className="w-3.5 h-3.5" />
                            Limpiar filtros
                        </button>
                    </div>
                )}

                {!hayFiltros && (
                    <p className="mt-4 text-xs text-gray-400 italic">
                        Sin filtros → el reporte incluirá todos los datos disponibles.
                    </p>
                )}
            </div>

            {/* Cards de reportes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ReportCard
                    title="Membresías"
                    description="Socios activos con nivel, estado y fecha de registro"
                    icon="👥"
                    color="emerald"
                    filtros={{ club: nombreClubSeleccionado, fecha: selectedFecha }}
                    loading={loading.membresias}
                    onDownload={() => handleDownload('membresias')}
                />
                <ReportCard
                    title="Asistencias"
                    description="Asistencias registradas con hora, racha y estado"
                    icon="✅"
                    color="blue"
                    filtros={{ club: nombreClubSeleccionado, fecha: selectedFecha }}
                    loading={loading.asistencias}
                    onDownload={() => handleDownload('asistencias')}
                />
            </div>

            {/* Nota */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Seleccioná una <strong>fecha específica</strong> para obtener el
                    reporte de actividad del día. Combinado con el filtro de club, podés analizar el
                    movimiento de cada sede en particular.
                </p>
            </div>
        </div>
    );
}

// ─── ReportCard ────────────────────────────────────────────────────────────

function ReportCard({ title, description, icon, color, filtros, loading, onDownload }) {
    const colorMap = {
        emerald: {
            bg: 'bg-emerald-50',
            border: 'hover:border-emerald-400',
            btn: 'bg-emerald-600 hover:bg-emerald-700',
            badge: 'bg-emerald-100 text-emerald-700',
        },
        blue: {
            bg: 'bg-blue-50',
            border: 'hover:border-blue-400',
            btn: 'bg-blue-600 hover:bg-blue-700',
            badge: 'bg-blue-100 text-blue-700',
        },
    };
    const c = colorMap[color] || colorMap.emerald;

    return (
        <div className={`bg-white rounded-xl shadow-md border-2 border-gray-200 ${c.border} transition-colors overflow-hidden`}>
            {/* Top accent */}
            <div className={`${c.bg} px-6 pt-6 pb-4 text-center`}>
                <div className="text-5xl mb-3">{icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            {/* Filter summary */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 space-y-1">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Parámetros del PDF</p>
                <p className="text-xs text-gray-700">
                    🏢 <span className="font-medium">{filtros.club || 'Todos los clubes'}</span>
                </p>
                <p className="text-xs text-gray-700">
                    📅 <span className="font-medium">
                        {filtros.fecha
                            ? new Date(filtros.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                                day: '2-digit', month: 'long', year: 'numeric'
                            })
                            : 'Todas las fechas'}
                    </span>
                </p>
            </div>

            {/* Button */}
            <div className="px-6 py-4">
                <button
                    onClick={onDownload}
                    disabled={loading}
                    className={`w-full px-4 py-3 ${c.btn} text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium text-sm`}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generando PDF...
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            Descargar PDF
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
