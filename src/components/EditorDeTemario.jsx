// src/components/EditorDeTemario.jsx (TU CÓDIGO CON LAS CORRECCIONES FINALES)

import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import { downloadExcelTemario } from "../utils/downloadExcel";
import encabezadoImagen from '../assets/encabezado.png';
import pieDePaginaImagen from '../assets/pie_de_pagina.png';
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

const toDataURL = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada');
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

  // 1. AJUSTE CLAVE: Nos aseguramos que la ref se llame pdfContentRef
  const pdfContentRef = useRef(null); 

  const [params, setParams] = useState({
    tecnologia: temarioInicial?.version_tecnologia || '',
    tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
    extension_curso_dias: temarioInicial?.numero_sesiones || 1,
    nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
    audiencia: temarioInicial?.audiencia || '',
    enfoque: temarioInicial?.enfoque || ''
  });

  useEffect(() => {
    setTemario(temarioInicial);
  }, [temarioInicial]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemario(prev => ({ ...prev, [name]: value }));
  };

  const handleTemarioChange = (capIndex, subIndex, value) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario));
    if (subIndex === null) {
      nuevoTemario.temario[capIndex].capitulo = value;
    } else {
      if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex].nombre = value;
      } else {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex] = value;
      }
    }
    setTemario(nuevoTemario);
  };

  const handleParamsChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
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
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ cursoId, contenido: temario, nota })
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

// --- FUNCIÓN DE EXPORTACIÓN FINAL (CON PLANTILLA Y SIN MARCA DE AGUA) ---
const exportarPDF = async () => {
    setTimeout(async () => {
      const elemento = pdfContentRef.current; 
      if (!elemento) {
        setErrorUi("Error: No se encontró el contenido para exportar.");
        return;
      }
      setOkUi("Generando PDF profesional...");
      setErrorUi("");
      elemento.classList.add('pdf-exporting');

      try {
        const options = {
          margin: [1, 1, 1, 1], // [Arriba, Izquierda, Abajo, Derecha] en pulgadas
          filename: `Temario_${slugify(temario.nombre_curso)}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak: { mode: 'css', avoid: '.pdf-capitulo' }
        };

        const worker = html2pdf().set(options).from(elemento).toPdf();
        const pdf = await worker.get('pdf');
        const totalPages = pdf.internal.getNumberOfPages();
        
        const encabezadoDataUrl = await toDataURL(encabezadoImagen);
        const pieDePaginaDataUrl = await toDataURL(pieDePaginaImagen);

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // --- LÓGICA DE POSICIONAMIENTO CORREGIDA ---
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          // --- 1. CÁLCULO Y DIBUJO DEL ENCABEZADO (SUPERIOR IZQUIERDA) ---
          const propsEncabezado = pdf.getImageProperties(encabezadoDataUrl);
          // Define un ancho para la imagen (ej: 3.5 pulgadas). AJÚSTALO SI LO NECESITAS.
          const anchoEncabezado = 3.5; 
          // Calcula el alto proporcional para que no se deforme
          const altoEncabezado = anchoEncabezado * (propsEncabezado.height / propsEncabezado.width);
          // Posición X: El margen izquierdo
          const xEncabezado = options.margin[1];
          // Posición Y: El margen superior
          const yEncabezado = options.margin[0];
          pdf.addImage(encabezadoDataUrl, 'PNG', xEncabezado, yEncabezado, anchoEncabezado, altoEncabezado);

          // --- 2. CÁLCULO Y DIBUJO DEL PIE DE PÁGINA (INFERIOR DERECHA) ---
          const propsPie = pdf.getImageProperties(pieDePaginaDataUrl);
          // Define un ancho para la imagen (ej: 4 pulgadas). AJÚSTALO SI LO NECESITAS.
          const anchoPie = 4;
          // Calcula el alto proporcional
          const altoPie = anchoPie * (propsPie.height / propsPie.width);
          // Posición X: Ancho de página - ancho de la imagen - margen derecho
          const xPie = pageWidth - anchoPie - options.margin[3];
          // Posición Y: Alto de página - alto de la imagen - margen inferior
          const yPie = pageHeight - altoPie - options.margin[2];
          pdf.addImage(pieDePaginaDataUrl, 'PNG', xPie, yPie, anchoPie, altoPie);

          // --- 3. AÑADE LA NUMERACIÓN DE PÁGINA ---
          pdf.setFontSize(9);
          pdf.setTextColor("#6c757d");
          const pageNumText = `Página ${i} de ${totalPages}`;
          const pageNumWidth = pdf.getStringUnitWidth(pageNumText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
          // Posiciona el número en la parte inferior central
          pdf.text(pageNumText, (pageWidth - pageNumWidth) / 2, pageHeight - 0.5);
        }
        
        await worker.save();
        setOkUi("PDF exportado correctamente ✔");

      } catch (error) {
        console.error("Error al generar PDF:", error);
        setErrorUi("Error al generar el PDF.");
      } finally {
        elemento.classList.remove('pdf-exporting');
      }
    }, 0); 
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

      {/* --- CONTENIDO OCULTO PARA PDF --- */}
      {/* 3. AJUSTE CLAVE: La 'ref' se asigna aquí, al div que contiene el contenido limpio */}
      <div ref={pdfContentRef} className="pdf-clean">
          <div className="pdf-body">
            <h1 className="pdf-title">{temario?.nombre_curso || temario?.tema_curso}</h1>
            <div className="pdf-meta">
              {temario?.version_tecnologia && <div><strong>Versión:</strong> {temario.version_tecnologia}</div>}
              {temario?.horas_totales && <div><strong>Horas Totales:</strong> {temario.horas_totales}</div>}
              {temario?.numero_sesiones && <div><strong>Sesiones:</strong> {temario.numero_sesiones}</div>}
              {temario?.EOL && <div><strong>EOL:</strong> {temario.EOL}</div>}
              {temario?.porcentaje_teoria_practica_general && (<div><strong>Distribución:</strong> {temario.porcentaje_teoria_practica_general}</div>)}
            </div>
            {temario?.descripcion_general && (<><h2>Descripción General</h2><p className="pdf-justify">{temario.descripcion_general}</p></>)}
            {temario?.audiencia && (<><h2>Audiencia</h2><p className="pdf-justify">{temario.audiencia}</p></>)}
            {temario?.prerrequisitos && (<><h2>Prerrequisitos</h2><p className="pdf-justify">{temario.prerrequisitos}</p></>)}
            {temario?.objetivos && (<><h2>Objetivos</h2><p className="pdf-justify" style={{ whiteSpace: 'pre-wrap' }}>{temario.objetivos}</p></>)}
            
            <h2>Temario</h2>
            {(temario?.temario || []).map((cap, i) => (
              <div key={i} className="pdf-capitulo">
                <h3>{cap.capitulo}</h3>
                {(cap.tiempo_capitulo_min || cap.porcentaje_teoria_practica_capitulo) && (
                  <div className="pdf-cap-meta">
                    {cap.tiempo_capitulo_min ? <span><strong>Duración:</strong> {cap.tiempo_capitulo_min} min</span> : null}
                    {cap.tiempo_capitulo_min && cap.porcentaje_teoria_practica_capitulo ? <span> • </span> : null}
                    {cap.porcentaje_teoria_practica_capitulo ? (<span><strong>Distribución:</strong> {cap.porcentaje_teoria_practica_capitulo}</span>) : null}
                  </div>
                )}
                {cap.objetivos_capitulo && (
                  <div className="pdf-objetivos-cap">
                    <strong>Objetivos:</strong>
                    <div className="pdf-objetivos-lista">
                      {Array.isArray(cap.objetivos_capitulo) ? cap.objetivos_capitulo.map((obj, idx) => (<div key={idx} className="pdf-objetivo-item">• {obj}</div>)) : <div className="pdf-objetivo-item">• {cap.objetivos_capitulo}</div>}
                    </div>
                  </div>
                )}
                <ul className="pdf-subcapitulos">
                  {(cap.subcapitulos || []).map((sub, j) => {
                    const nombre = typeof sub === 'object' ? sub.nombre : sub;
                    const t = typeof sub === 'object' ? sub.tiempo_subcapitulo_min : undefined;
                    const s = typeof sub === 'object' ? sub.sesion : undefined;
                    return (
                      <li key={j}>
                        <span>{nombre}</span>
                        {(t || s) && (<span className="pdf-sub-meta">{t ? `${t} min` : ''}{t && s ? ' • ' : ''}{s ? `Sesión ${s}` : ''}</span>)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
      </div>

      {/* --- INTERFAZ DE EDICIÓN VISIBLE (TU CÓDIGO ORIGINAL SIN CAMBIOS) --- */}
      <div className="app-view">
          <div className="vista-selector">
              <button className={`btn-vista ${vista === 'resumida' ? 'activo' : ''}`} onClick={() => setVista('resumida')}>Vista Detallada</button>
              <button className={`btn-vista ${vista === 'detallada' ? 'activo' : ''}`} onClick={() => setVista('detallada')}>Vista Resumida</button>
          </div>
          <div className="vista-info">
              {vista === 'resumida' ? (<p>📝 Vista completa con todos los campos editables organizados verticalmente</p>) : (<p>📋 Vista compacta con campos organizados en grillas para edición rápida</p>)}
          </div>
          {isLoading ? (
              <div className="spinner-container"><div className="spinner"></div><p>Generando nueva versión...</p></div>
          ) : (
              // Este div ya no necesita la ref
              <div>
                  {vista === 'detallada' ? (
                      <div>
                          <label className="editor-label">Nombre del Curso</label><textarea name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo" />
                          <label className="editor-label">Versión de la Tecnología</label><input name="version_tecnologia" value={temario.version_tecnologia || ''} onChange={handleInputChange} className="input-campo" />
                          <label className="editor-label">Horas Totales</label><input name="horas_totales" type="number" value={temario.horas_totales || ''} onChange={handleInputChange} className="input-campo" />
                          <label className="editor-label">Número de Sesiones</label><input name="numero_sesiones" type="number" value={temario.numero_sesiones || ''} onChange={handleInputChange} className="input-campo" />
                          <label className="editor-label">EOL (Soporte)</label><input name="EOL" value={temario.EOL || ''} onChange={handleInputChange} className="input-campo" placeholder="12 meses" />
                          <label className="editor-label">Porcentaje Teoría/Práctica General</label><input name="porcentaje_teoria_practica_general" value={temario.porcentaje_teoria_practica_general || ''} onChange={handleInputChange} className="input-campo" placeholder="30% Teoría / 70% Práctica" />
                          <label className="editor-label">Descripción General</label><textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-descripcion" />
                          <label className="editor-label">Audiencia</label><textarea name="audiencia" value={temario.audiencia || ''} onChange={handleInputChange} className="textarea-descripcion" />
                          <label className="editor-label">Prerrequisitos</label><textarea name="prerrequisitos" value={temario.prerrequisitos || ''} onChange={handleInputChange} className="textarea-descripcion" />
                          <label className="editor-label">Objetivos</label><textarea name="objetivos" value={temario.objetivos || ''} onChange={handleInputChange} className="textarea-descripcion" placeholder="Lista los objetivos principales del curso, separados por líneas" />
                          <h3>Temario Resumido</h3>
                          {(temario.temario || []).map((cap, capIndex) => (
                              <div key={capIndex} className="capitulo-editor">
                                  <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo" placeholder="Nombre del capítulo"/>
                                  <div className="capitulo-info-grid">{/*...*/}</div>
                                  <div className="objetivos-capitulo">{/*...*/}</div>
                                  <ul>
                                      {(cap.subcapitulos || []).map((sub, subIndex) => ( <li key={subIndex}><input value={typeof sub === 'object' ? sub.nombre : sub} onChange={(e) => handleTemarioChange(capIndex, subIndex, e.target.value)} className="input-subcapitulo" placeholder="Nombre del subcapítulo"/></li> ))}
                                  </ul>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="vista-resumida-editable">
                          <input name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo-resumido" placeholder="Nombre del curso" />
                          <div className="info-grid">{/*...*/}</div>
                          <div className="seccion-editable">{/*...*/}</div>
                          <h3>Temario Detallado</h3>
                          {(temario.temario || []).map((cap, capIndex) => (
                              <div key={capIndex} className="capitulo-resumido">
                                  <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo-resumido" placeholder="Nombre del capítulo"/>
                                  <div className="info-grid-capitulo">{/*...*/}</div>
                                  <div className="objetivos-capitulo-resumido">{/*...*/}</div>
                                  <div className="subcapitulos-resumidos">
                                      {(cap.subcapitulos || []).map((sub, subIndex) => (
                                          <div key={subIndex} className="subcapitulo-item">{/*...*/}</div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
      </div>

      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar(prev => !prev)}>Ajustar y Regenerar</button>
        <button className="btn-secundario" onClick={handleSaveClick} disabled={guardando}>{guardando ? "Guardando..." : "Guardar Versión"}</button>
        <button className="btn-secundario" onClick={abrirExportar}>Exportar...</button>
      </div>

      {mostrarFormRegenerar && (
        <div className="regenerar-form">{/*...*/}</div>
      )}

      {modalExportar && (
        <div className="modal-overlay" onClick={() => setModalExportar(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Exportar</h3>
              <button className="modal-close" onClick={() => setModalExportar(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="export-format">
                <label><input type="radio" checked={exportTipo === "pdf"} onChange={() => setExportTipo("pdf")} /> PDF</label>
                <label><input type="radio" checked={exportTipo === "excel"} onChange={() => setExportTipo("excel")} /> Excel</label>
              </div>
            </div>
            <div className="modal-footer">
              {exportTipo === "pdf" ? (<button onClick={exportarPDF} className="btn-guardar">Exportar PDF</button>) : (<button onClick={exportarExcel} className="btn-guardar">Exportar Excel</button>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorDeTemario;





