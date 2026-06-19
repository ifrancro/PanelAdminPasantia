import React, { useState, useEffect, useRef } from 'react';
import { FileText, Download, Loader2, Calendar, Building2, AlertCircle } from 'lucide-react';
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
import { useAuth } from '../../context/AuthContext';

export default function ReportsPage() {
    const { user } = useAuth();
    const isAnfitrion = user?.rol?.nombre?.toUpperCase() === "ANFITRION";

    const [clubes, setClubes] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [selectedFecha, setSelectedFecha] = useState('');
    const [loadingData, setLoadingData] = useState(false);
    const [downloading, setDownloading] = useState({ membresias: false, asistencias: false });

    // Datos ocultos para generar gráficos en PDF
    const [membresiasData, setMembresiasData] = useState([]);
    const [asistenciasData, setAsistenciasData] = useState([]);

    const chartMembresiasRef = useRef(null);
    const chartAsistenciasRef = useRef(null);

    const hoy = new Date().toISOString().split('T')[0];

    useEffect(() => {
        fetchClubes();
    }, []);

    const fetchClubes = async () => {
        try {
            const response = await getAllClubes();
            let clubesActivos = response.data.filter(c => c.estado === 'ACTIVO');

            // Filtrar clubes si es Anfitrión
            if (isAnfitrion) {
                clubesActivos = clubesActivos.filter(c => 
                    c.usuarioId === user?.id || 
                    c.anfitrionId === user?.id || 
                    (c.anfitrionNombre && user?.nombre && c.anfitrionNombre.toLowerCase().includes(user.nombre.toLowerCase()))
                );
            }

            setClubes(clubesActivos);

            // Seleccionar el primer club automáticamente si es anfitrión
            if (isAnfitrion && clubesActivos.length > 0) {
                setSelectedClubId(clubesActivos[0].id);
            }
        } catch {
            console.error('Error al cargar clubes');
        }
    };

    const fetchDatosTemp = async (tipo) => {
        const clubId = selectedClubId || null;
        const fecha = selectedFecha || null;
        
        if (tipo === 'membresias') {
            const data = await fetchMembresiasForReport(clubId, fecha);
            setMembresiasData(data);
            return data;
        } else if (tipo === 'asistencias') {
            const data = await fetchAsistenciasForReport(clubId, fecha);
            setAsistenciasData(data);
            return data;
        }
    };

    const captureChartImage = async (ref) => {
        if (!ref.current) return null;
        // Pequeña pausa para permitir que Recharts renderice en el DOM oculto
        await new Promise(resolve => setTimeout(resolve, 300));
        try {
            const canvas = await html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff' });
            return canvas.toDataURL('image/png');
        } catch (e) {
            console.error("Error capturing chart", e);
            return null;
        }
    };

    const nombreClubSeleccionado = clubes.find(c => String(c.id) === String(selectedClubId))?.nombreClub || null;

    const handleDownload = async (tipo) => {
        try {
            setDownloading(prev => ({ ...prev, [tipo]: true }));

            // 1. Cargar datos
            const data = await fetchDatosTemp(tipo);

            if (!data || data.length === 0) {
                Swal.fire('Sin datos', 'No hay registros para generar este reporte con los filtros actuales.', 'info');
                setDownloading(prev => ({ ...prev, [tipo]: false }));
                return;
            }

            // 2. Capturar gráfico (oculto en el DOM)
            const ref = tipo === 'membresias' ? chartMembresiasRef : chartAsistenciasRef;
            const chartImg = await captureChartImage(ref);

            // 3. Generar PDF
            const fecha = selectedFecha || null;
            if (tipo === 'membresias') {
                await generateMembresiaReport(data, chartImg, nombreClubSeleccionado, fecha);
            } else if (tipo === 'asistencias') {
                await generateAsistenciasReport(data, chartImg, nombreClubSeleccionado, fecha);
            }

            Swal.fire({
                icon: 'success',
                title: 'Reporte Generado',
                text: 'El documento se ha descargado correctamente.',
                confirmButtonColor: '#0f172a',
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire('Error', 'No se pudo generar el reporte', 'error');
        } finally {
            setDownloading(prev => ({ ...prev, [tipo]: false }));
        }
    };

    // Procesar datos para Gráficos ocultos
    const activeMembresias = membresiasData.filter(m => m.estado === 'ACTIVO').length;
    const inactiveMembresias = membresiasData.length - activeMembresias;
    const chartDataMembresias = [
        { name: 'Activos', valor: activeMembresias, fill: '#10b981' },
        { name: 'Inactivos', valor: inactiveMembresias, fill: '#64748b' }
    ];

    const asisAsistio = asistenciasData.filter(a => a.estado === 'ASISTIO').length;
    const asisFalto = asistenciasData.filter(a => a.estado === 'FALTO').length;
    const asisJustificado = asistenciasData.filter(a => a.estado === 'JUSTIFICADO').length;
    const chartDataAsistencias = [
        { name: 'Asistió', cantidad: asisAsistio, fill: '#3b82f6' },
        { name: 'Faltó', cantidad: asisFalto, fill: '#ef4444' },
        { name: 'Justificado', cantidad: asisJustificado, fill: '#f59e0b' }
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header - Estilo Reportes Hub */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex flex-col gap-2 mb-8">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <FileText className="w-8 h-8 text-herbalife-green" />
                        Centro de Reportes
                    </h1>
                    <p className="text-sm font-medium text-slate-500">
                        Genera y descarga reportes en formato PDF. Los datos mostrados corresponden únicamente a la información que tu rol está autorizado a ver.
                    </p>
                </div>

                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-100">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Club / Sede {isAnfitrion && "(Tu Club)"}
                        </label>
                        <select
                            value={selectedClubId}
                            onChange={e => setSelectedClubId(e.target.value)}
                            disabled={isAnfitrion && clubes.length === 1}
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm bg-white font-medium shadow-sm transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            {!isAnfitrion && <option value="">Todos los clubes</option>}
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

            {/* Hub de Botones de Reporte (No Dashboards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Tarjeta de Reporte de Membresías */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center hover:border-herbalife-green transition-colors">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-4xl">
                        👥
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Reporte de Membresías</h3>
                    <p className="text-sm text-slate-500 mb-6 flex-1">
                        Documento PDF con el listado completo de socios y su estado actual.
                    </p>
                    <button
                        onClick={() => handleDownload('membresias')}
                        disabled={downloading.membresias}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-md transition-all"
                    >
                        {downloading.membresias ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        {downloading.membresias ? 'Generando PDF...' : 'Descargar PDF'}
                    </button>
                </div>

                {/* Tarjeta de Reporte de Asistencias */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center hover:border-herbalife-green transition-colors">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-4xl">
                        ✅
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Reporte de Asistencias</h3>
                    <p className="text-sm text-slate-500 mb-6 flex-1">
                        Documento PDF con el registro de entradas, rachas y estados de asistencia.
                    </p>
                    <button
                        onClick={() => handleDownload('asistencias')}
                        disabled={downloading.asistencias}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-md transition-all"
                    >
                        {downloading.asistencias ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        {downloading.asistencias ? 'Generando PDF...' : 'Descargar PDF'}
                    </button>
                </div>

            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Los reportes se generan dinámicamente incluyendo gráficos profesionales internos dentro del PDF. Selecciona los filtros y haz clic en descargar.
                </p>
            </div>

            {/* DOM OCULTO PARA GENERACIÓN DE GRÁFICOS PARA EL PDF */}
            {/* Se renderizan fuera de la vista para que html2canvas pueda capturarlos sin afectar la UI */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '800px', height: '400px', backgroundColor: '#fff' }}>
                <div ref={chartMembresiasRef} style={{ width: '800px', height: '400px', background: '#fff', padding: '20px' }}>
                    {membresiasData.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartDataMembresias} cx="50%" cy="50%" innerRadius={100} outerRadius={150} paddingAngle={2} dataKey="valor" stroke="none">
                                    {chartDataMembresias.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '18px', fontWeight: 'bold' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div ref={chartAsistenciasRef} style={{ width: '800px', height: '400px', background: '#fff', padding: '20px' }}>
                    {asistenciasData.length > 0 && (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartDataAsistencias} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 16, fontWeight: 'bold' }} />
                                <YAxis tick={{ fontSize: 16 }} />
                                <Bar dataKey="cantidad" radius={[8, 8, 0, 0]} barSize={80}>
                                    {chartDataAsistencias.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

        </div>
    );
}
