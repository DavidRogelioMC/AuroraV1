// src/components/EditorDeTemario.jsx
import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./EditorDeTemario.css";

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  // Exportar a PDF (lo que ya tienes funcionando)
  const exportToPDF = (temario) => {
    if (!temario) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Temario: ${temario.tema_curso}`, 10, 10);

    if (temario.secciones && temario.secciones.length > 0) {
      const rows = temario.secciones.map((s, i) => [i + 1, s.titulo, s.descripcion]);
      doc.autoTable({
        head: [["#", "Sección", "Descripción"]],
        body: rows,
        startY: 20,
      });
    }

    doc.save(`temario_${temario.tema_curso || "curso"}.pdf`);
  };

  // Exportar a Excel (nuevo)
  const exportToExcel = (temario) => {
    if (!temario) return;

    const worksheet = XLSX.utils.json_to_sheet(temario.secciones || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Temario");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(data, `temario_${temario.tema_curso || "curso"}.xlsx`);
  };

  return (
    <div className="editor-temario-container">
      <h3>Temario Generado</h3>

      <div className="acciones">
        <button onClick={() => onRegenerate(temarioInicial)} disabled={isLoading}>
          {isLoading ? "Regenerando..." : "Regenerar"}
        </button>
        <button onClick={() => onSave(temarioInicial)}>Guardar versión</button>
        <button onClick={() => exportToPDF(temarioInicial)}>Exportar PDF</button>
        <button onClick={() => exportToExcel(temarioInicial)}>Exportar Excel</button>
      </div>

      <pre className="temario-json">
        {JSON.stringify(temarioInicial, null, 2)}
      </pre>
    </div>
  );
}

export default EditorDeTemario;
