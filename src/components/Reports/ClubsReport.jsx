import React, { useState } from 'react';
import { reportService } from '../../services/reportService';
import ReportFilters from './ReportFilters';

/**
 * Componente para reporte comparativo de clubes
 */
export default function ClubsReport() {
    const [loading, setLoading] = useState(false);

    const handleGenerate = async (filters) => {
        setLoading(true);
        try {
            await reportService.downloadClubsReport(filters);
        } catch (error) {
            alert('Error al generar el reporte. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🏪</span>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Reporte Comparativo de Clubes</h3>
                    <p className="text-sm text-gray-500">Desempeño de todos los clubes</p>
                </div>
            </div>

            <ReportFilters onGenerate={handleGenerate} loading={loading} includeClubFilter={false} />

            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-purple-800">
                    <strong>Incluye:</strong> Tabla comparativa con miembros, pedidos y asistencias de cada club
                </p>
            </div>
        </div>
    );
}
