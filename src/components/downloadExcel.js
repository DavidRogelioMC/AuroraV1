// src/utils/downloadExcel.js
export function downloadTemarioAsExcel(temarioJson, cursoId = "curso", versionId = "version") {
  const lines = [];
  const safe = (v) => {
    const s = (v ?? "").toString().replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };

  // Cabeceras básicas
  lines.push(["Campo", "Valor"].map(safe).join(","));
  lines.push(["Nombre del curso", temarioJson?.nombre_curso || ""].map(safe).join(","));
  lines.push(["Versión tecnología", temarioJson?.version_tecnologia || ""].map(safe).join(","));
  lines.push(["Horas totales", temarioJson?.horas_totales || ""].map(safe).join(","));
  lines.push(["Número de sesiones", temarioJson?.numero_sesiones || ""].map(safe).join(","));
  lines.push(["EOL", temarioJson?.EOL || ""].map(safe).join(","));
  lines.push(["% Teoría/Práctica general", temarioJson?.porcentaje_teoria_practica_general || ""].map(safe).join(","));
  lines.push([]);

  // Secciones largas
  lines.push(["Descripción general", (temarioJson?.descripcion_general || "").replace(/\n/g, " ")].map(safe).join(","));
  lines.push(["Audiencia", (temarioJson?.audiencia || "").replace(/\n/g, " ")].map(safe).join(","));
  lines.push(["Prerrequisitos", (temarioJson?.prerrequisitos || "").replace(/\n/g, " ")].map(safe).join(","));
  lines.push(["Objetivos", (temarioJson?.objetivos || "").replace(/\n/g, " ")].map(safe).join(","));
  lines.push([]);

  // Temario detallado
  lines.push(["Capítulo", "Subcapítulo", "Duración cap (min)", "Distribución cap", "Tiempo sub (min)", "Sesión"].map(safe).join(","));
  for (const cap of (temarioJson?.temario || [])) {
    const capTitulo = cap?.capitulo || "";
    const dur = cap?.tiempo_capitulo_min ?? "";
    const dist = cap?.porcentaje_teoria_practica_capitulo || "";
    const subs = cap?.subcapitulos || [];

    if (!subs.length) {
      lines.push([capTitulo, "", dur, dist, "", ""].map(safe).join(","));
    } else {
      for (const sub of subs) {
        const nombreSub = typeof sub === "object" ? (sub?.nombre || "") : (sub ?? "");
        const tSub = typeof sub === "object" ? (sub?.tiempo_subcapitulo_min ?? "") : "";
        const ses = typeof sub === "object" ? (sub?.sesion ?? "") : "";
        lines.push([capTitulo, nombreSub, dur, dist, tSub, ses].map(safe).join(","));
      }
    }
  }

  const csv = lines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });

  const file = `${cursoId}_${versionId}.csv`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = file;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}
