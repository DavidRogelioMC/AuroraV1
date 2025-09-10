import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import { downloadExcelTemario } from "../utils/downloadExcel";
import "./EditorDeTemario.css";

const API_BASE = import.meta.env.VITE_TEMARIOS_API || "";

function slugify(str = "") {
  return String(str)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "curso";
}

function nowIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState("detallada"); // 'detallada' | 'resumida'
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorUi, setErrorUi] = useState("");
  const [okUi, setOkUi] = useState("");
  const [modalVersiones, setModalVersiones] = useState(false);
  const [versiones, setVersiones] = useState([]);
  const [cargandoVersiones, setCargandoVersiones] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);
  const [exportTipo, setExportTipo] = useState("pdf");
  const [seleccionadas, setSeleccionadas] = useState({});
  const pdfTargetRef = useRef(null);

  const [params, setParams] = useState({
    tecnologia: temarioInicial?.version_tecnologia || "",
    tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || "",
    extension_curso_dias: temarioInicial?.numero_sesiones || 1,
    nivel_dificultad: temarioInicial?.nivel_dificultad || "basico",
    audiencia: temarioInicial?.audiencia || "",
    enfoque: temarioInicial?.enfoque || ""
  });

  useEffect(() => {
    setTemario(temarioInicial);
  }, [temarioInicial]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemario((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemarioChange = (capIndex, subIndex, value) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario));
    if (subIndex === null) {
      nuevoTemario.temario[capIndex].capitulo = value;
    } else {
      if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === "object") {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex].nombre = value;
      } else {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex] = value;
      }
    }
    setTemario(nuevoTemario);
  };

  const handleParamsChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegenerateClick = () => {
    setErrorUi("");
    setOkUi("");
    onRegenerate(params);
    setMostrarFormRegenerar(false);
  };

  const handleSaveClick = async () => {
    setErrorUi("");
    setOkUi("");
    if (!API_BASE) {
      setErrorUi("Falta configurar VITE_TEMARIOS_API.");
      return;
    }
    try {
      setGuardando(true);
      const cursoId = slugify(temario?.nombre_curso || params?.tema_curso || "curso");
      const nota =
        window.prompt("Escribe una nota para esta versión (opcional):", `Guardado ${nowIso()}`) ||
        "";
      const token = localStorage.getItem("id_token") || "";
      const res = await fetch(`${API_BASE.replace(/\/$/, "")}/temarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          cursoId,
          contenido: temario,
          nota
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error al guardar versión");
      setOkUi(`Versión guardada ✔ (versionId: ${data.versionId || "N/A"})`);
    } catch (err) {
      console.error(err);
      setErrorUi(err.message || "Error al guardar versión");
    } finally {
      setGuardando(false);
    }
  };

  const exportarPDF = () => {
    if (!pdfTargetRef.current) return;
    const titulo = temario?.nombre_curso || "temario";
    const filename = `temario_${String(titulo).replace(/\s+/g, "_")}_${vista}.pdf`;
    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      })
      .from(pdfTargetRef.current)
      .save();
  };

  const exportarExcel = () => {
    if (!temario) {
      setErrorUi("No hay temario para exportar");
      return;
    }
    downloadExcelTemario(temario);
    setOkUi("Exportado correctamente ✔");
    setModalExportar(false);
  };

  const abrirExportar = () => {
    setModalExportar(true);
    setErrorUi("");
    setOkUi("");
  };

  if (!temario) return null;

  return (
    <div className="editor-container">
      {(errorUi || okUi) && (
        <div className="ui-messages">
          {errorUi && <div className="msg error">{errorUi}</div>}
          {okUi && <div className="msg ok">{okUi}</div>}
        </div>
      )}

      {/* Selector de vista */}
      <div className="vista-selector">
        <button
          className={`btn-vista ${vista === "detallada" ? "activo" : ""}`}
          onClick={() => setVista("detallada")}
        >
          Vista Detallada
        </button>
        <button
          className={`btn-vista ${vista === "resumida" ? "activo" : ""}`}
          onClick={() => setVista("resumida")}
        >
          Vista Resumida
        </button>
      </div>

      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Generando nueva versión...</p>
        </div>
      ) : (
        <div ref={pdfTargetRef}>
          {/* Vista detallada */}
          {vista === "detallada" ? (
            <div>
              <h3>{temario?.nombre_curso || "Curso sin título"}</h3>
              <p><strong>Versión:</strong> {temario?.version_tecnologia || "-"}</p>
              <p><strong>Horas totales:</strong> {temario?.horas_totales || "-"}</p>
              <p><strong>Sesiones:</strong> {temario?.numero_sesiones || "-"}</p>
              <p><strong>Audiencia:</strong> {temario?.audiencia || "-"}</p>
              <p><strong>Descripción:</strong> {temario?.descripcion_general || "-"}</p>
              <h4>Capítulos</h4>
              <ul>
                {(temario?.temario || []).map((cap, i) => (
                  <li key={i}>
                    <strong>{cap.capitulo}</strong>
                    <ul>
                      {(cap.subcapitulos || []).map((sub, j) => (
                        <li key={j}>
                          {typeof sub === "object" ? sub.nombre : sub}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            // Vista resumida
            <pre className="temario-json">
              {JSON.stringify(temario, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar((p) => !p)}>
          Ajustar y Regenerar
        </button>
        <button className="btn-secundario" onClick={handleSaveClick} disabled={guardando}>
          {guardando ? "Guardando..." : "Guardar Versión"}
        </button>
        <button className="btn-secundario" onClick={exportarPDF}>
          Exportar PDF
        </button>
        <button className="btn-exportar" onClick={exportarExcel}>
          Exportar Excel
        </button>
      </div>

      {mostrarFormRegenerar && (
        <div className="regenerar-form">
          <h4>Regenerar con Nuevos Parámetros</h4>
          <input
            name="tecnologia"
            value={params.tecnologia}
            onChange={handleParamsChange}
            placeholder="Tecnología"
          />
          <input
            name="tema_curso"
            value={params.tema_curso}
            onChange={handleParamsChange}
            placeholder="Tema del curso"
          />
          <button onClick={handleRegenerateClick}>Regenerar</button>
        </div>
      )}

      {modalExportar && (
        <div className="modal-overlay" onClick={() => setModalExportar(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Exportar</h3>
              <button className="modal-close" onClick={() => setModalExportar(false)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <label>
                <input
                  type="radio"
                  checked={exportTipo === "pdf"}
                  onChange={() => setExportTipo("pdf")}
                />
                PDF
              </label>
              <label>
                <input
                  type="radio"
                  checked={exportTipo === "excel"}
                  onChange={() => setExportTipo("excel")}
                />
                Excel
              </label>
            </div>
            <div className="modal-footer">
              {exportTipo === "pdf" ? (
                <button onClick={exportarPDF}>Exportar PDF</button>
              ) : (
                <button onClick={exportarExcel}>Exportar Excel</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorDeTemario;


