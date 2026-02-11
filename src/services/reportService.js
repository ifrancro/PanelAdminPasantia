import api from '../api/axios';

/**
 * Servicio para gestión de reportes
 */
export const reportService = {
    /**
     * Descarga reporte de membresías en PDF
     * @param {Object} filters - { fechaInicio, fechaFin, clubId? }
     */
    downloadMembershipReport: async (filters) => {
        try {
            const params = new URLSearchParams();
            params.append('fechaInicio', filters.fechaInicio);
            params.append('fechaFin', filters.fechaFin);
            if (filters.clubId) params.append('clubId', filters.clubId);

            const response = await api.get(`/reportes/membresias/pdf?${params}`, {
                responseType: 'blob',
            });

            // Crear link de descarga
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_membresias_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error al descargar reporte de membresías:', error);
            throw error;
        }
    },

    /**
     * Descarga reporte de pedidos en PDF
     * @param {Object} filters - { fechaInicio, fechaFin, clubId? }
     */
    downloadOrdersReport: async (filters) => {
        try {
            const params = new URLSearchParams();
            params.append('fechaInicio', filters.fechaInicio);
            params.append('fechaFin', filters.fechaFin);
            if (filters.clubId) params.append('clubId', filters.clubId);

            const response = await api.get(`/reportes/pedidos/pdf?${params}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_pedidos_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error al descargar reporte de pedidos:', error);
            throw error;
        }
    },

    /**
     * Descarga reporte de asistencias en PDF
     * @param {Object} filters - { fechaInicio, fechaFin, clubId? }
     */
    downloadAttendanceReport: async (filters) => {
        try {
            const params = new URLSearchParams();
            params.append('fechaInicio', filters.fechaInicio);
            params.append('fechaFin', filters.fechaFin);
            if (filters.clubId) params.append('clubId', filters.clubId);

            const response = await api.get(`/reportes/asistencias/pdf?${params}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_asistencias_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error al descargar reporte de asistencias:', error);
            throw error;
        }
    },

    /**
     * Descarga reporte comparativo de clubes en PDF
     * @param {Object} filters - { fechaInicio, fechaFin }
     */
    downloadClubsReport: async (filters) => {
        try {
            const params = new URLSearchParams();
            params.append('fechaInicio', filters.fechaInicio);
            params.append('fechaFin', filters.fechaFin);

            const response = await api.get(`/reportes/clubes/pdf?${params}`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_clubes_${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error('Error al descargar reporte de clubes:', error);
            throw error;
        }
    },
};
