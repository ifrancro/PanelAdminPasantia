import React from 'react';
import MembershipReport from '../../components/Reports/MembershipReport';
import OrdersReport from '../../components/Reports/OrdersReport';
import AttendanceReport from '../../components/Reports/AttendanceReport';
import ClubsReport from '../../components/Reports/ClubsReport';

/**
 * 📊 ReportsPage
 * Página principal de reportes con 4 tipos de reportes en formato PDF
 */
export default function ReportsPage() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl p-6 shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Reportes</h1>
                <p className="text-gray-600">
                    Genera reportes en PDF para analizar el desempeño del club
                </p>
            </div>

            {/* Grid de Reportes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MembershipReport />
                <OrdersReport />
                <AttendanceReport />
                <ClubsReport />
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Instrucciones</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Selecciona el rango de fechas para filtrar la información</li>
                    <li>• Opcionalmente filtra por un club específico (excepto en reporte de clubes)</li>
                    <li>• Haz clic en "Generar Reporte PDF" para descargar automáticamente</li>
                    <li>• El PDF se generará con datos en tiempo real del sistema</li>
                </ul>
            </div>
        </div>
    );
}
