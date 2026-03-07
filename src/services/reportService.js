/**
 * 📊 reportService.js
 * Servicio para generar reportes en PDF usando jsPDF (frontend only)
 * Soporta filtros por: clubId y/o fechaFiltro (YYYY-MM-DD)
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAllMembresiasByClub } from './MembresiaService';
import api from '../api/api';

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Formatea 'YYYY-MM-DD' → 'DD/MM/YYYY'
 */
const formatLocalDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const parts = String(isoDate).split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Dibuja el encabezado estándar de un reporte
 * @returns {number} Y position after header
 */
const drawHeader = (doc, titulo, generado, filtros) => {
    // Logo / franja verde
    doc.setFillColor(124, 179, 66);
    doc.rect(0, 0, 210, 12, 'F');

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(titulo, 105, 8.5, { align: 'center' });

    // Reset color
    doc.setTextColor(40, 40, 40);

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado: ${generado}`, 14, 18);

    let y = 18;
    if (filtros.length > 0) {
        y += 6;
        doc.setFontSize(8.5);
        doc.setTextColor(80, 80, 80);
        filtros.forEach((f, i) => {
            doc.text(f, 14, 18 + 6 * (i + 1));
        });
        y = 18 + 6 * (filtros.length + 1);
        doc.setTextColor(40, 40, 40);
    }

    return y + 4;
};

/**
 * Agrega pie de página en todas las hojas
 */
const addFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7.5);
        doc.setFont(undefined, 'italic');
        doc.setTextColor(120, 120, 120);
        doc.text(
            `Herbalife Clubes — Sistema de Gestión   |   Pág. ${i} / ${pageCount}`,
            105,
            doc.internal.pageSize.height - 8,
            { align: 'center' }
        );
    }
};

// ─── Membresías ────────────────────────────────────────────────────────────

/**
 * Genera reporte de membresías en PDF
 * @param {string|null} clubId    - Filtrar por club ID
 * @param {string|null} fechaFiltro - Filtrar por fecha de registro 'YYYY-MM-DD'
 * @param {string|null} clubNombre  - Nombre del club seleccionado (para el header)
 */
export const generateMembresiaReport = async (clubId = null, fechaFiltro = null, clubNombre = null) => {
    try {
        let membresias = [];
        if (clubId) {
            const response = await getAllMembresiasByClub(clubId);
            membresias = response.data;
        } else {
            const clubesResponse = await api.get('/clubes');
            const clubes = clubesResponse.data.filter(c => c.estado === 'ACTIVO');
            const allPromises = clubes.map(club => getAllMembresiasByClub(club.id).catch(() => ({ data: [] })));
            const allResponses = await Promise.all(allPromises);
            membresias = allResponses.flatMap(r => r.data);
        }

        // ── Filtrar por fecha de registro si se proporciona ──
        if (fechaFiltro) {
            membresias = membresias.filter(m => {
                if (!m.fechaRegistro) return false;
                // fechaRegistro es LocalDateTime → 'YYYY-MM-DDTHH:mm:ss'
                return m.fechaRegistro.startsWith(fechaFiltro);
            });
        }

        const doc = new jsPDF();
        const generado = new Date().toLocaleString('es-ES');

        const filtros = [];
        if (clubNombre) filtros.push(`Club: ${clubNombre}`);
        if (fechaFiltro) filtros.push(`Fecha de registro: ${formatLocalDate(fechaFiltro)}`);
        if (!clubNombre && !fechaFiltro) filtros.push('Sin filtros aplicados (todos los clubes y fechas)');

        const startY = drawHeader(doc, 'REPORTE DE MEMBRESÍAS', generado, filtros);

        // Totalizador
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(`Total de membresías: ${membresias.length}`, 14, startY + 2);

        if (membresias.length === 0) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('No se encontraron membresías para los filtros seleccionados.', 105, startY + 14, { align: 'center' });
        } else {
            const tableData = membresias.map(m => [
                m.id,
                m.usuarioNombre || 'N/A',
                m.clubNombre || 'N/A',
                m.nivelNombre || 'Básico',
                m.estado || 'N/A',
                m.fechaRegistro ? formatLocalDate(m.fechaRegistro.split('T')[0]) : 'N/A',
            ]);

            autoTable(doc, {
                startY: startY + 8,
                head: [['ID', 'Usuario', 'Club', 'Nivel', 'Estado', 'F. Registro']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [124, 179, 66], fontSize: 9, fontStyle: 'bold' },
                bodyStyles: { fontSize: 8.5 },
                alternateRowStyles: { fillColor: [245, 250, 240] },
            });
        }

        addFooter(doc);
        doc.save(`reporte_membresias_${fechaFiltro || 'todas'}_${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generando reporte de membresías:', error);
        throw new Error('No se pudo generar el reporte de membresías');
    }
};

// ─── Asistencias ───────────────────────────────────────────────────────────

/**
 * Genera reporte de asistencias en PDF
 * AsistenciaDTO: id, membresiaId, membresiaNumeroSocio, clubId, clubNombre,
 *                fechaHora (LocalDateTime), fechaDia (LocalDate), estado, rachaActual, rachaMaxima
 *
 * @param {string|null} clubId     - Filtrar por club ID
 * @param {string|null} fechaFiltro  - Filtrar por fecha exacta 'YYYY-MM-DD'
 * @param {string|null} clubNombre   - Nombre del club seleccionado (para el header)
 */
export const generateAsistenciasReport = async (clubId = null, fechaFiltro = null, clubNombre = null) => {
    try {
        let asistencias = [];
        if (clubId) {
            const response = await api.get(`/asistencias/club/${clubId}`);
            asistencias = response.data;
        } else {
            const clubesResponse = await api.get('/clubes');
            const clubes = clubesResponse.data.filter(c => c.estado === 'ACTIVO');
            const allPromises = clubes.map(club =>
                api.get(`/asistencias/club/${club.id}`).catch(() => ({ data: [] }))
            );
            const allResponses = await Promise.all(allPromises);
            asistencias = allResponses.flatMap(r => r.data);
        }

        // ── Filtrar por fecha exacta (fechaDia = 'YYYY-MM-DD') ──
        if (fechaFiltro) {
            asistencias = asistencias.filter(a => a.fechaDia === fechaFiltro);
        }

        const doc = new jsPDF();
        const generado = new Date().toLocaleString('es-ES');

        const filtros = [];
        if (clubNombre) filtros.push(`Club: ${clubNombre}`);
        if (fechaFiltro) filtros.push(`Fecha: ${formatLocalDate(fechaFiltro)}`);
        if (!clubNombre && !fechaFiltro) filtros.push('Sin filtros aplicados (todos los clubes y fechas)');

        const startY = drawHeader(doc, 'REPORTE DE ASISTENCIAS', generado, filtros);

        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(`Total de asistencias: ${asistencias.length}`, 14, startY + 2);

        if (asistencias.length === 0) {
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(150, 150, 150);
            doc.text('No se encontraron asistencias para los filtros seleccionados.', 105, startY + 14, { align: 'center' });
        } else {
            const tableData = asistencias.map(a => {
                // fechaDia: 'YYYY-MM-DD'
                const fechaFmt = formatLocalDate(a.fechaDia);

                // fechaHora: 'YYYY-MM-DDTHH:mm:ss' → extraer hora
                let horaFmt = 'N/A';
                if (a.fechaHora) {
                    const dt = new Date(a.fechaHora);
                    if (!isNaN(dt.getTime())) {
                        horaFmt = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                    }
                }

                return [
                    a.id,
                    a.membresiaNumeroSocio || `Membresía #${a.membresiaId}`,
                    a.clubNombre || 'N/A',
                    fechaFmt,
                    horaFmt,
                    a.estado || 'N/A',
                    a.rachaActual ?? '-',
                ];
            });

            autoTable(doc, {
                startY: startY + 8,
                head: [['ID', 'N° Socio', 'Club', 'Fecha', 'Hora', 'Estado', 'Racha']],
                body: tableData,
                theme: 'grid',
                headStyles: { fillColor: [124, 179, 66], fontSize: 9, fontStyle: 'bold' },
                bodyStyles: { fontSize: 8 },
                alternateRowStyles: { fillColor: [245, 250, 240] },
                columnStyles: {
                    0: { cellWidth: 10 },
                    6: { cellWidth: 16 },
                },
            });
        }

        addFooter(doc);
        doc.save(`reporte_asistencias_${fechaFiltro || 'todas'}_${Date.now()}.pdf`);
        return true;
    } catch (error) {
        console.error('Error generando reporte de asistencias:', error);
        throw new Error('No se pudo generar el reporte de asistencias');
    }
};
