/**
 * 📊 reportService.js
 * Servicio para generar reportes en PDF usando jsPDF (frontend only)
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAllMembresiasByClub } from './MembresiaService';
import api from '../api/api';

/**
 * Genera reporte de membresías en PDF
 */
export const generateMembresiaReport = async (clubId = null) => {
    try {
        // Obtener datos - usar endpoint correcto
        let membresias = [];
        if (clubId) {
            const response = await getAllMembresiasByClub(clubId);
            membresias = response.data;
        } else {
            // Obtener todas las membresías de todos los clubes
            const clubesResponse = await api.get('/clubes');
            const clubes = clubesResponse.data.filter(c => c.estado === 'ACTIVO');

            // Obtener membresías de cada club
            const allPromises = clubes.map(club => getAllMembresiasByClub(club.id));
            const allResponses = await Promise.all(allPromises);
            membresias = allResponses.flatMap(r => r.data);
        }

        // Crear documento PDF
        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('REPORTE DE MEMBRESÍAS', 105, 15, { align: 'center' });

        // Fecha
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const fecha = new Date().toLocaleString('es-ES');
        doc.text(`Generado: ${fecha}`, 105, 22, { align: 'center' });

        // Filtro
        if (clubId) {
            doc.setFontSize(9);
            doc.text(`Filtrado por Club ID: ${clubId}`, 14, 30);
        }

        // Total
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`Total de membresías: ${membresias.length}`, 14, clubId ? 36 : 30);

        // Tabla
        const tableData = membresias.map(m => [
            m.id,
            m.usuarioNombre || 'N/A',
            m.clubNombre || 'N/A',
            m.nivelNombre || 'Básico',
            m.estado || 'N/A'
        ]);

        autoTable(doc, {
            startY: clubId ? 40 : 35,
            head: [['ID', 'Usuario', 'Club', 'Nivel', 'Estado']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [124, 179, 66] }, // Verde Herbalife
            styles: { fontSize: 9 },
        });

        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.text(
                'Herbalife Clubes - Sistema de Gestión',
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        // Descargar
        doc.save(`reporte_membresias_${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generando reporte:', error);
        throw new Error('No se pudo generar el reporte');
    }
};

/**
 * Genera reporte de pedidos en PDF (SIN PRECIOS)
 */
export const generatePedidosReport = async (clubId = null) => {
    try {
        const endpoint = clubId ? `/pedidos/club/${clubId}` : '/pedidos';
        const response = await api.get(endpoint);
        const pedidos = response.data;

        const doc = new jsPDF();

        // Título
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('REPORTE DE PEDIDOS', 105, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const fecha = new Date().toLocaleString('es-ES');
        doc.text(`Generado: ${fecha}`, 105, 22, { align: 'center' });

        if (clubId) {
            doc.setFontSize(9);
            doc.text(`Filtrado por Club ID: ${clubId}`, 14, 30);
        }

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`Total de pedidos: ${pedidos.length}`, 14, clubId ? 36 : 30);

        // Tabla (SIN columna de precio)
        const tableData = pedidos.map(p => [
            p.id,
            p.clubNombre || 'N/A',
            p.horarioDeseado || 'N/A',
            p.tipoConsumo || 'N/A',
            p.estado || 'N/A',
            new Date(p.fechaPedido).toLocaleDateString('es-ES')
        ]);

        autoTable(doc, {
            startY: clubId ? 40 : 35,
            head: [['ID', 'Club', 'Horario', 'Tipo', 'Estado', 'Fecha']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [124, 179, 66] },
            styles: { fontSize: 8 },
        });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.text(
                'Herbalife Clubes - Sistema de Gestión',
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        doc.save(`reporte_pedidos_${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generando reporte:', error);
        throw new Error('No se pudo generar el reporte');
    }
};

/**
 * Genera reporte de asistencias en PDF
 */
export const generateAsistenciasReport = async (clubId = null) => {
    try {
        const endpoint = clubId ? `/asistencias/club/${clubId}` : '/asistencias';
        const response = await api.get(endpoint);
        const asistencias = response.data;

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('REPORTE DE ASISTENCIAS', 105, 15, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        const fecha = new Date().toLocaleString('es-ES');
        doc.text(`Generado: ${fecha}`, 105, 22, { align: 'center' });

        if (clubId) {
            doc.setFontSize(9);
            doc.text(`Filtrado por Club ID: ${clubId}`, 14, 30);
        }

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(`Total de asistencias: ${asistencias.length}`, 14, clubId ? 36 : 30);

        const tableData = asistencias.map(a => [
            a.id,
            a.socioNombre || 'N/A',
            a.clubNombre || 'N/A',
            new Date(a.fechaAsistencia).toLocaleDateString('es-ES'),
            a.horaAsistencia || 'N/A'
        ]);

        autoTable(doc, {
            startY: clubId ? 40 : 35,
            head: [['ID', 'Socio', 'Club', 'Fecha', 'Hora']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [124, 179, 66] },
            styles: { fontSize: 9 },
        });

        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setFont(undefined, 'italic');
            doc.text(
                'Herbalife Clubes - Sistema de Gestión',
                105,
                doc.internal.pageSize.height - 10,
                { align: 'center' }
            );
        }

        doc.save(`reporte_asistencias_${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generando reporte:', error);
        throw new Error('No se pudo generar el reporte');
    }
};
