// src/components/EditorDeTemario.jsx
import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import "./EditorDeTemario.css";

// Utilidad: slugify para IDs
function slugify(str = "") {
  return String(str)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "curso";
}

// Exportar CSV en memoria (Excel lo abre sin problemas)
function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => {
    const s = (cell ?? "").toString();
    if (s.includes('"') || s.includes(",") || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);

  const pdfTargetRef = useRef(null);

  useEffect(() => {
    setTemario(temarioInicial);
  }, [temarioInicial]);

  // Exportar PDF
  const exportarPDF = () => {
    if (!pdfTargetRef.current) return;
    const titulo = temario?.nombre_curso || "temario";
    const filename = `temario_${String(titulo).replace(/\s+/g, "_")}.pdf`;
    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      })
      .from(pdfTargetRef.current)
      .save();
  };

  // Exportar Excel (CSV)
  const exportarCSV = () => {
    if (!temario) return;
    const rows = [];
    rows.push(["Curso", temario?.nombre_curso || ""]);
    rows.push(["Versión", temario?.version_tecnologia || ""]);
    rows.push([]);
    rows.push(["Capítulo", "Subcapítulo"]);

    (temario?.temario || []).forEach(cap => {
      const capitulo = cap?.capitulo || "";
      if (cap?.subcapitulos?.length) {
        cap.subcapitulos.forEach(sub => {
          const nombreSub = typeof sub === "object" ? sub.nombre : sub;
          rows.push([capitulo, nombreSub || ""]);
        });
      } else {
        rows.push([capitulo, ""]);
      }
    });

    const filename = `temario_${slugify(temario?.nombre_curso)}.csv`;
    downloadCSV(filename, rows);
  };

  if (!temario) return null;

  return (
    <div className="editor-container">
      <h3>Temario Generado</h3>

      {/* Acciones */}
      <div className="acciones-footer">
        <button onClick={() => onRegenerate(temario)} disabled={isLoading}>
          {isLoading ? "Regenerando..." : "Regenerar"}
        </button>
        <button className="btn-guardar" onClick={() => onSave(temario)}>
          Guardar versión
        </button>
        <button className="btn-secundario" onClick={exportarPDF}>
          Exportar PDF
        </button>
        <button className="btn-exportar" onClick={exportarCSV}>
          Exportar Excel (CSV)
        </button>
      </div>

      {/* Contenido para PDF */}
      <div ref={pdfTargetRef}>
        <pre className="temario-json">
          {JSON.stringify(temario, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default EditorDeTemario;

