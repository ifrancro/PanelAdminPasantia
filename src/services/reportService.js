/**
 * 📊 reportService.js
 * Servicio para generar reportes en PDF corporativos usando jsPDF
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAllMembresiasByClub } from './MembresiaService';
import api from '../api/api';

// ─── Data Fetchers (Exported for UI Preview) ───────────────────────────────

export const fetchMembresiasForReport = async (clubId = null, fechaFiltro = null) => {
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

    if (fechaFiltro) {
        membresias = membresias.filter(m => {
            if (!m.fechaRegistro) return false;
            return m.fechaRegistro.startsWith(fechaFiltro);
        });
    }
    return membresias;
};

export const fetchAsistenciasForReport = async (clubId = null, fechaFiltro = null) => {
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

    if (fechaFiltro) {
        asistencias = asistencias.filter(a => a.fechaDia === fechaFiltro);
    }
    return asistencias;
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const formatLocalDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    const parts = String(isoDate).split('-');
    if (parts.length !== 3) return isoDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

/**
 * Estilo Corporativo / Ejecutivo
 */
const drawCorporateHeader = (doc, titulo, generado, filtros) => {
    // Fondo oscuro premium para la cabecera
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 24, 'F');

    // Título Principal
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(titulo.toUpperCase(), 15, 12);

    // Fecha Generación
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(148, 163, 184); // Slate-400
    doc.text(`Generado el: ${generado}`, 15, 18);

    // Bloque de Filtros
    let startY = 32;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(51, 65, 85); // Slate-700
    doc.text('PARÁMETROS DEL INFORME', 15, startY);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(15, startY + 2, 195, startY + 2);

    startY += 8;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(71, 85, 105); // Slate-600

    if (filtros.length === 0) {
        doc.text('Todos los registros', 15, startY);
        startY += 6;
    } else {
        filtros.forEach(f => {
            doc.text(`• ${f}`, 15, startY);
            startY += 6;
        });
    }

    return startY + 5;
};

const addFooter = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252); // Slate-50
        doc.rect(0, 287, 210, 10, 'F');
        doc.setFontSize(7);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text(
            `Sistema Integral de Gestión Herbalife  |  Documento Confidencial  |  Página ${i} de ${pageCount}`,
            105,
            293,
            { align: 'center' }
        );
    }
};

// ─── Generadores ───────────────────────────────────────────────────────────

export const generateMembresiaReport = async (membresias, chartImage = null, clubNombre = null, fechaFiltro = null) => {
    const doc = new jsPDF();
    const generado = new Date().toLocaleString('es-ES');

    const filtros = [];
    if (clubNombre) filtros.push(`Sede / Club: ${clubNombre}`);
    if (fechaFiltro) filtros.push(`Fecha de Registro: ${formatLocalDate(fechaFiltro)}`);

    let startY = drawCorporateHeader(doc, 'Reporte Ejecutivo de Membresías', generado, filtros);

    // Kpis Summary
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.text(`Total de registros: ${membresias.length}`, 15, startY);
    startY += 6;

    // Inject Chart Image
    if (chartImage) {
        // Asume un chart de 800x400 approx (proporción 2:1)
        const imgWidth = 180;
        const imgHeight = 70; 
        
        // Marco sutil para el gráfico
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(252, 253, 253);
        doc.roundedRect(15, startY, imgWidth, imgHeight + 4, 2, 2, 'FD');
        
        doc.addImage(chartImage, 'PNG', 15, startY + 2, imgWidth, imgHeight);
        startY += imgHeight + 12;
    }

    if (membresias.length === 0) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.text('No se encontraron registros para estos parámetros.', 105, startY + 10, { align: 'center' });
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
            startY: startY,
            head: [['ID', 'USUARIO', 'CLUB / SEDE', 'NIVEL', 'ESTADO', 'REGISTRO']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: 50 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                4: { halign: 'center' },
                5: { halign: 'center' }
            },
            margin: { left: 15, right: 15 }
        });
    }

    addFooter(doc);
    doc.save(`Reporte_Ejecutivo_Membresias_${Date.now()}.pdf`);
};

export const generateAsistenciasReport = async (asistencias, chartImage = null, clubNombre = null, fechaFiltro = null) => {
    const doc = new jsPDF();
    const generado = new Date().toLocaleString('es-ES');

    const filtros = [];
    if (clubNombre) filtros.push(`Sede / Club: ${clubNombre}`);
    if (fechaFiltro) filtros.push(`Fecha: ${formatLocalDate(fechaFiltro)}`);

    let startY = drawCorporateHeader(doc, 'Reporte Ejecutivo de Asistencias', generado, filtros);

    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`Total de asistencias registradas: ${asistencias.length}`, 15, startY);
    startY += 6;

    // Inject Chart Image
    if (chartImage) {
        const imgWidth = 180;
        const imgHeight = 70; 
        
        doc.setDrawColor(226, 232, 240);
        doc.setFillColor(252, 253, 253);
        doc.roundedRect(15, startY, imgWidth, imgHeight + 4, 2, 2, 'FD');
        
        doc.addImage(chartImage, 'PNG', 15, startY + 2, imgWidth, imgHeight);
        startY += imgHeight + 12;
    }

    if (asistencias.length === 0) {
        doc.setFontSize(10);
        doc.setFont(undefined, 'italic');
        doc.text('No se encontraron registros para estos parámetros.', 105, startY + 10, { align: 'center' });
    } else {
        const tableData = asistencias.map(a => {
            const fechaFmt = formatLocalDate(a.fechaDia);
            let horaFmt = 'N/A';
            if (a.fechaHora) {
                const dt = new Date(a.fechaHora);
                if (!isNaN(dt.getTime())) {
                    horaFmt = dt.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                }
            }
            return [
                a.id,
                a.membresiaNumeroSocio || `#${a.membresiaId}`,
                a.clubNombre || 'N/A',
                `${fechaFmt} ${horaFmt}`,
                a.estado || 'N/A',
                a.rachaActual ?? '-',
            ];
        });

        autoTable(doc, {
            startY: startY,
            head: [['ID', 'SOCIO', 'CLUB / SEDE', 'FECHA Y HORA', 'ESTADO', 'RACHA']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
            bodyStyles: { fontSize: 8, textColor: 50 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                4: { halign: 'center' },
                5: { halign: 'center', cellWidth: 20 }
            },
            margin: { left: 15, right: 15 }
        });
    }

    addFooter(doc);
    doc.save(`Reporte_Ejecutivo_Asistencias_${Date.now()}.pdf`);
};
