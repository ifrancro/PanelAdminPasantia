import React, { useState, useEffect } from 'react';
import { clubService } from '../../services/clubService';

/**
 * Componente reutilizable para filtros de reportes
 */
export default function ReportFilters({ onGenerate, includeClubFilter = true, loading = false }) {
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [clubId, setClubId] = useState('');
    const [clubes, setClubes] = useState([]);

    useEffect(() => {
        // Establecer fechas por defecto (último mes)
        const hoy = new Date();
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);

        setFechaFin(hoy.toISOString().split('T')[0]);
        setFechaInicio(haceUnMes.toISOString().split('T')[0]);

        // Cargar clubes si es necesario
        if (includeClubFilter) {
            loadClubes();
        }
    }, [includeClubFilter]);

    const loadClubes = async () => {
        try {
            const data = await clubService.getClubes();
            setClubes(data);
        } catch (error) {
            console.error('Error al cargar clubes:', error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!fechaInicio || !fechaFin) {
            alert('Por favor selecciona ambas fechas');
            return;
        }

        const filters = {
            fechaInicio,
            fechaFin,
            ...(includeClubFilter && clubId && { clubId: parseInt(clubId) }),
        };

        onGenerate(filters);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fecha Inicio */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Inicio
                    </label>
                    <input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>

                {/* Fecha Fin */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha Fin
                    </label>
                    <input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        required
                    />
                </div>

                {/* Club (opcional) */}
                {includeClubFilter && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Club (opcional)
                        </label>
                        <select
                            value={clubId}
                            onChange={(e) => setClubId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Todos los clubes</option>
                            {clubes.map((club) => (
                                <option key={club.id} value={club.id}>
                                    {club.nombreClub}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Botón Generar */}
            <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
                {loading ? '⏳ Generando...' : '📄 Generar Reporte PDF'}
            </button>
        </form>
    );
}
