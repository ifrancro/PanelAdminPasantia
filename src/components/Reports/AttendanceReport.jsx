import React, { useState } from 'react';
import { reportService } from '../../services/reportService';
import ReportFilters from './ReportFilters';

/**
 * Componente para reporte de asistencias
 */
export default function AttendanceReport() {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (filters) => {
        setLoading(true);
        try {
            await reportService.downloadAttendanceReport(filters);
        } catch (error) {
            alert('Error al generar el reporte. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Reporte de Asistencias</h3>
                    <p className="text-sm text-gray-500">Visitas y miembros más activos</p>
                </div>
            </div>

            <ReportFilters onGenerate={handleGenerate} loading={loading} includeClubFilter={true} />

            <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-800">
                    <strong>Incluye:</strong> Total de asistencias, promedio por miembro, top 10 miembros más activos, distribución por día
                </p>
            </div>
        </div>
    );
}
