/**
 * 📊 ReportsPage.jsx
 * Página de reportes con generación de PDF en el navegador (frontend only)
 */
import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { getAllClubes } from '../../services/ClubService';
import {
    generateMembresiaReport,
    generatePedidosReport,
    generateAsistenciasReport
} from '../../services/reportService';
import Swal from 'sweetalert2';

export default function ReportsPage() {
    const [clubes, setClubes] = useState([]);
    const [selectedClubId, setSelectedClubId] = useState('');
    const [loading, setLoading] = useState({
        membresias: false,
        pedidos: false,
        asistencias: false
    });

    useEffect(() => {
        fetchClubes();
    }, []);

    const fetchClubes = async () => {
        try {
            const response = await getAllClubes();
            const clubesActivos = response.data.filter(c => c.estado === 'ACTIVO');
            setClubes(clubesActivos);
        } catch (error) {
            console.error('Error al cargar clubes:', error);
        }
    };

    const handleDownload = async (tipo) => {
        const clubId = selectedClubId || null;

        try {
            setLoading(prev => ({ ...prev, [tipo]: true }));

            let success = false;
            switch (tipo) {
                case 'membresias':
                    success = await generateMembresiaReport(clubId);
                    break;
                case 'pedidos':
                    success = await generatePedidosReport(clubId);
                    break;
                case 'asistencias':
                    success = await generateAsistenciasReport(clubId);
                    break;
                default:
                    break;
            }

            if (success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Reporte descargado!',
                    text: 'El PDF se ha generado correctamente',
                    confirmButtonColor: '#7CB342'
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo generar el reporte',
                confirmButtonColor: '#7CB342'
            });
        } finally {
            setLoading(prev => ({ ...prev, [tipo]: false }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
                        <p className="text-sm text-gray-500">
                            Genera y descarga reportes en PDF
                        </p>
                    </div>
                </div>

                {/* Filtro de Club */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filtrar por Club (opcional)
                    </label>
                    <select
                        value={selectedClubId}
                        onChange={(e) => setSelectedClubId(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    >
                        <option value="">Todos los clubes</option>
                        {clubes.map(club => (
                            <option key={club.id} value={club.id}>
                                {club.nombreClub}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid de Reportes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Reporte de Membresías */}
                <ReportCard
                    title="Membresías"
                    description="Reporte de membresías activas con nivel y estado"
                    icon="👥"
                    loading={loading.membresias}
                    onDownload={() => handleDownload('membresias')}
                />

                {/* Reporte de Pedidos */}
                <ReportCard
                    title="Pedidos"
                    description="Reporte de pedidos por club y estado (sin precios)"
                    icon="📦"
                    loading={loading.pedidos}
                    onDownload={() => handleDownload('pedidos')}
                />

                {/* Reporte de Asistencias */}
                <ReportCard
                    title="Asistencias"
                    description="Reporte de asistencias por club y fecha"
                    icon="✅"
                    loading={loading.asistencias}
                    onDownload={() => handleDownload('asistencias')}
                />
            </div>

            {/* Nota informativa */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                    <strong>💡 Nota:</strong> Los reportes se generan directamente en tu navegador.
                    Puedes aplicar un filtro por club o generar el reporte completo sin filtros.
                </p>
            </div>
        </div>
    );
}

/**
 * Componente de tarjeta de reporte
 */
function ReportCard({ title, description, icon, loading, onDownload }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-gray-200 hover:border-green-500 transition-colors">
            <div className="text-center">
                <div className="text-5xl mb-3">{icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-4 h-12">{description}</p>

                <button
                    onClick={onDownload}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generando...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Descargar PDF
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
