import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Loader2, Calendar, Building2, Users, CheckCircle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

import { getAllClubes } from '../../services/ClubService';
import {
    fetchMembresiasForReport,
    fetchAsistenciasForReport,
    generateMembresiaReport,
    generateAsistenciasReport
} from '../../services/reportService';

export default function ReportsPage() {
    const [clubes, setClubes] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [selectedFecha, setSelectedFecha] = useState('');
    const [loadingData, setLoadingData] = useState(false);
    const [downloading, setDownloading] = useState({ membresias: false, asistencias: false });

    const [membresiasData, setMembresiasData] = useState([]);
    const [asistenciasData, setAsistenciasData] = useState([]);

    const chartMembresiasRef = useRef(null);
    const chartAsistenciasRef = useRef(null);

    const hoy = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchClubes();
    }, []);

    useEffect(() => {
        // Fetch data for previews every time filters change
        fetchPreviewData();
    }, [selectedClubId, selectedFecha]);

    const fetchClubes = async () => {
        try {
            const response = await getAllClubes();
            setClubes(response.data.filter(c => c.estado === 'ACTIVO'));
        } catch {
            console.error('Error al cargar clubes');
        }
    };

    const fetchPreviewData = async () => {
        setLoadingData(true);
        try {
            const clubId = selectedClubId || null;
            const fecha = selectedFecha || null;
            
            const [membresias, asistencias] = await Promise.all([
                fetchMembresiasForReport(clubId, fecha),
                fetchAsistenciasForReport(clubId, fecha)
            ]);
            
            setMembresiasData(membresias);
            setAsistenciasData(asistencias);
        } catch (error) {
            console.error("Error fetching preview data", error);
        } finally {
            setLoadingData(false);
        }
    };

    const nombreClubSeleccionado = clubes.find(c => String(c.id) === String(selectedClubId))?.nombreClub || null;

    const captureChartImage = async (ref) => {
        if (!ref.current) return null;
        try {
            const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff' });
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error("Error capturing chart", e);
            return null;
        }
    };

    const handleDownload = async (tipo) => {
        const clubId = selectedClubId || null;
        const fecha = selectedFecha || null;

        try {
            setDownloading(prev => ({ ...prev, [tipo]: true }));

            if (tipo === 'membresias') {
                const chartImg = await captureChartImage(chartMembresiasRef);
                await generateMembresiaReport(membresiasData, chartImg, nombreClubSeleccionado, fecha);
            } else if (tipo === 'asistencias') {
                const chartImg = await captureChartImage(chartAsistenciasRef);
                await generateAsistenciasReport(asistenciasData, chartImg, nombreClubSeleccionado, fecha);
            }

            Swal.fire({
                icon: 'success',
                title: '¡Reporte Ejecutivo Generado!',
                text: 'El documento se ha descargado correctamente.',
                confirmButtonColor: '#0f172a',
                timer: 2500,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error de generación',
                text: error.message || 'Intenta de nuevo.',
                confirmButtonColor: '#0f172a',
            });
        } finally {
            setDownloading(prev => ({ ...prev, [tipo]: false }));
        }
    };

    // Procesar datos para Gráfico de Membresías (Distribución por Estado)
    const activeMembresias = membresiasData.filter(m => m.estado === 'ACTIVO').length;
    const inactiveMembresias = membresiasData.length - activeMembresias;
    const chartDataMembresias = [
        { name: 'Activos', valor: activeMembresias, fill: '#10b981' }, // Verde
        { name: 'Inactivos', valor: inactiveMembresias, fill: '#64748b' } // Slate
    ];

    // Procesar datos para Gráfico de Asistencias (Por Estado)
    const asisAsistio = asistenciasData.filter(a => a.estado === 'ASISTIO').length;
    const asisFalto = asistenciasData.filter(a => a.estado === 'FALTO').length;
    const asisJustificado = asistenciasData.filter(a => a.estado === 'JUSTIFICADO').length;
    
    const chartDataAsistencias = [
        { name: 'Asistió', cantidad: asisAsistio, fill: '#3b82f6' }, // Azul
        { name: 'Faltó', cantidad: asisFalto, fill: '#ef4444' }, // Rojo
        { name: 'Justificado', cantidad: asisJustificado, fill: '#f59e0b' } // Ambar
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header Corporativo */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Centro de Reportes</h1>
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Análisis ejecutivo y exportación de métricas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Sede / Club
                        </label>
                        <select
                            value={selectedClubId}
                            onChange={e => setSelectedClubId(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm bg-white font-medium shadow-sm transition-all"
                        >
                            <option value="">Todas las sedes operativas</option>
                            {clubes.map(club => (
                                <option key={club.id} value={club.id}>
                                    {club.nombreClub}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            Fecha de Corte
                        </label>
                        <input
                            type="date"
                            value={selectedFecha}
                            onChange={e => setSelectedFecha(e.target.value)}
                            max={hoy}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm bg-white font-medium shadow-sm transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Cards de Exportación y Previsualización */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Panel Membresías */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Users className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Reporte de Membresías</h3>
                                <p className="text-xs text-slate-500 font-medium">{membresiasData.length} registros encontrados</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDownload('membresias')}
                            disabled={downloading.membresias || loadingData}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all font-semibold text-sm shadow-md"
                        >
                            {downloading.membresias ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Exportar PDF
                        </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50/50">
                        {loadingData ? (
                            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                        ) : membresiasData.length > 0 ? (
                            <div className="w-full h-56" ref={chartMembresiasRef}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartDataMembresias} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="valor" stroke="none">
                                            {chartDataMembresias.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No hay datos suficientes para visualizar.</p>
                        )}
                    </div>
                </div>

                {/* Panel Asistencias */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Control de Asistencias</h3>
                                <p className="text-xs text-slate-500 font-medium">{asistenciasData.length} registros encontrados</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDownload('asistencias')}
                            disabled={downloading.asistencias || loadingData}
                            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all font-semibold text-sm shadow-md"
                        >
                            {downloading.asistencias ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            Exportar PDF
                        </button>
                    </div>
                    <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50/50">
                        {loadingData ? (
                            <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                        ) : asistenciasData.length > 0 ? (
                            <div className="w-full h-56" ref={chartAsistenciasRef}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartDataAsistencias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Bar dataKey="cantidad" radius={[4, 4, 0, 0]} barSize={40}>
                                            {chartDataAsistencias.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">No hay datos suficientes para visualizar.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
