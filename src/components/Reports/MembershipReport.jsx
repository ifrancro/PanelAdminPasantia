import React, { useState } from 'react';
import { reportService } from '../../services/reportService';
import ReportFilters from './ReportFilters';

/**
 * Componente para reporte de membresías
 */
export default function MembershipReport() {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (filters) => {
        setLoading(true);
        try {
            await reportService.downloadMembershipReport(filters);
            // Éxito - el PDF se descarga automáticamente
        } catch (error) {
            alert('Error al generar el reporte. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Reporte de Membresías</h3>
                    <p className="text-sm text-gray-500">Estadísticas de socios activos e inactivos</p>
                </div>
            </div>

            <ReportFilters onGenerate={handleGenerate} loading={loading} includeClubFilter={true} />

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-800">
                    <strong>Incluye:</strong> Total de membresías, activas/inactivas, nuevas en el período, distribución por club y tasa de retención
                </p>
            </div>
        </div>
    );
}
