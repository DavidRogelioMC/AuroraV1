// src/utils/downloadExcel.js
// Intenta usar `xlsx`. Si no existe, genera un CSV como fallback.
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function toRowsFromTemario(temario) {
  const rows = [];
  rows.push(['Nombre del curso', temario?.nombre_curso || '']);
  rows.push(['Versión', temario?.version_tecnologia || '']);
  rows.push(['Horas totales', temario?.horas_totales || '']);
  rows.push(['Número de sesiones', temario?.numero_sesiones || '']);
  rows.push([]);
  rows.push(['Capítulo', 'Subcapítulo', 'Minutos', 'Sesión', 'Distribución', 'Objetivos capítulo']);

  (temario?.temario || []).forEach(cap => {
    const dist = cap?.porcentaje_teoria_practica_capitulo || '';
    const objetivos = Array.isArray(cap?.objetivos_capitulo)
      ? cap.objetivos_capitulo.join(' | ')
      : (cap?.objetivos_capitulo || '');

    if (Array.isArray(cap?.subcapitulos) && cap.subcapitulos.length > 0) {
      cap.subcapitulos.forEach(sub => {
        const nombre = typeof sub === 'object' ? (sub?.nombre || '') : (sub || '');
        const minutos = typeof sub === 'object' ? (sub?.tiempo_subcapitulo_min || '') : '';
        const sesion = typeof sub === 'object' ? (sub?.sesion || '') : '';
        rows.push([cap?.capitulo || '', nombre, minutos, sesion, dist, objetivos]);
      });
    } else {
      rows.push([cap?.capitulo || '', '', '', '', dist, objetivos]);
    }
  });

  return rows;
}

export async function downloadExcelTemario(temario) {
  const filenameBase = (temario?.nombre_curso || 'temario').toString().trim().replace(/\s+/g, '_');

  try {
    const XLSX = (await import('xlsx')).default;
    const rows = toRowsFromTemario(temario);
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Temario');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, `${filenameBase}.xlsx`);
  } catch {
    // Fallback CSV
    const rows = toRowsFromTemario(temario);
    const csv = rows.map(r =>
      r.map(cell => {
        const v = (cell ?? '').toString().replace(/"/g, '""');
        return `"${v}"`;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${filenameBase}.csv`);
  }
}
