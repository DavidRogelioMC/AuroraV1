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
    nivel_dificultad: temarioInicial?.nivel || temarioInicial?.nivel_dificultad || 'basico',
    sector: temarioInicial?.sector || '',
    enfoque: temarioInicial?.enfoque || '',
    objetivo_tipo: temarioInicial?.objetivo_tipo || 'saber_hacer',
    codigo_certificacion: temarioInicial?.codigo_certificacion || '',
    bloom_level_override: temarioInicial?.bloom_level_override || '',
    horas_por_sesion: temarioInicial?.horas_por_sesion || 7,
    numero_sesiones_por_semana: temarioInicial?.numero_sesiones_por_semana || 3 || 3
  });

  useEffect(() => {
    setTemario(temarioInicial);
  }, [temarioInicial]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'objetivos_generales') {
      // Convert string to array when saving
      setTemario(prev => ({ ...prev, [name]: value.split('\n').filter(line => line.trim()) }));
    } else {
      setTemario(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTemarioChange = (capIndex, subIndex, field, value) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario));
    if (subIndex === null) {
      // Editando el nombre del capítulo
      nuevoTemario.temario[capIndex].capitulo = value;
    } else {
      // Editando subcapítulo
      if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
        if (field) {
          nuevoTemario.temario[capIndex].subcapitulos[subIndex][field] = value;
        } else {
          nuevoTemario.temario[capIndex].subcapitulos[subIndex].nombre = value;
        }
      } else {
        // Convertir string a objeto si es necesario
        const nombreActual = nuevoTemario.temario[capIndex].subcapitulos[subIndex];
        nuevoTemario.temario[capIndex].subcapitulos[subIndex] = {
          nombre: field ? nombreActual : value,
          sesion: 1,
          tiempo_subcapitulo_min: 30,
          tipo: 'teoria',
          entregable: ''
        };
        if (field) {
          nuevoTemario.temario[capIndex].subcapitulos[subIndex][field] = value;
        }
      }
    }
    setTemario(nuevoTemario);
  };

  const handleParamsChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const eliminarSubcapitulo = (capIndex, subIndex) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario));
    nuevoTemario.temario[capIndex].subcapitulos.splice(subIndex, 1);
    setTemario(nuevoTemario);
  };

  const agregarSubcapitulo = (capIndex) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario));
    const nuevoSubcapitulo = {
      nombre: "Nuevo subcapítulo",
      sesion: 1,
      tiempo_subcapitulo_min: 30,
      tipo: 'teoria',
      entregable: ''
    };
    nuevoTemario.temario[capIndex].subcapitulos.push(nuevoSubcapitulo);
    setTemario(nuevoTemario);
  };

  const agregarCapitulo = () => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario));
    const nuevoCapitulo = {
      capitulo: "Nuevo Capítulo",
      tiempo_capitulo_min: 180,
      porcentaje_teoria_practica_capitulo: "50% Teoría / 50% Práctica",
      objetivos_capitulo: ["Objetivo del nuevo capítulo"],
      subcapitulos: [{
        nombre: "Introducción",
        sesion: 1,
        tiempo_subcapitulo_min: 30,
        tipo: 'teoria',
        entregable: ''
      }]
    };
    nuevoTemario.temario.push(nuevoCapitulo);
    setTemario(nuevoTemario);
  };

  const eliminarCapitulo = (capIndex) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario));
    nuevoTemario.temario.splice(capIndex, 1);
    setTemario(nuevoTemario);
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
          // =================================================================
          // ========= ESTA ES LA LÍNEA CORREGIDA Y MÁS IMPORTANTE =========
          // =================================================================
          // Define el área donde irá el TEXTO, dejando espacio para las imágenes.
          margin: [2, 1, 1.5, 1], // [Arriba, Izquierda, Abajo, Derecha] en pulgadas

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

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          // Dibuja las imágenes de borde a borde (estas no respetan el 'margin' de arriba)
          const propsEncabezado = pdf.getImageProperties(encabezadoDataUrl);
          const altoEncabezado = pageWidth * (propsEncabezado.height / propsEncabezado.width);
          pdf.addImage(encabezadoDataUrl, 'PNG', 0, 0, pageWidth, altoEncabezado); 

          const propsPie = pdf.getImageProperties(pieDePaginaDataUrl);
          const altoPie = pageWidth * (propsPie.height / propsPie.width);
          pdf.addImage(pieDePaginaDataUrl, 'PNG', 0, pageHeight - altoPie, pageWidth, altoPie);

          // Añade la numeración de página
          pdf.setFontSize(9);
          pdf.setTextColor("#6c757d");
          const pageNumText = `Página ${i} de ${totalPages}`;
          const pageNumWidth = pdf.getStringUnitWidth(pageNumText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
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
              {temario?.sector && <div><strong>Sector:</strong> {temario.sector}</div>}
              {temario?.nivel && <div><strong>Nivel:</strong> {temario.nivel}</div>}
              {temario?.horas_por_sesion && <div><strong>Horas por Sesión:</strong> {temario.horas_por_sesion}</div>}
              {temario?.numero_sesiones_por_semana && <div><strong>Sesiones por Semana:</strong> {temario.numero_sesiones_por_semana}</div>}
              {temario?.porcentaje_teoria && temario?.porcentaje_practica && (<div><strong>Distribución:</strong> {temario.porcentaje_teoria}% Teoría / {temario.porcentaje_practica}% Práctica</div>)}
            </div>
            {temario?.descripcion_general && (<><h2>Descripción General</h2><p className="pdf-justify">{temario.descripcion_general}</p></>)}
            {temario?.objetivos_generales && (
              <><h2>Objetivos Generales</h2>
              {Array.isArray(temario.objetivos_generales) ? (
                <ul className="pdf-objetivos">
                  {temario.objetivos_generales.map((obj, i) => <li key={i}>{obj}</li>)}
                </ul>
              ) : (
                <p className="pdf-justify" style={{ whiteSpace: 'pre-wrap' }}>{temario.objetivos_generales}</p>
              )}</>
            )}
            
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
                          <label className="editor-label">Sector</label><input name="sector" value={temario.sector || ''} onChange={handleInputChange} className="input-campo" placeholder="Ej: Bancario, Educativo, Salud" />
                          <label className="editor-label">Nivel</label>
                          <select name="nivel" value={temario.nivel || ''} onChange={handleInputChange} className="input-campo">
                            <option value="">Seleccionar nivel</option>
                            <option value="basico">Básico</option>
                            <option value="intermedio">Intermedio</option>
                            <option value="avanzado">Avanzado</option>
                          </select>
                          <label className="editor-label">Horas por Sesión</label><input name="horas_por_sesion" type="number" value={temario.horas_por_sesion || ''} onChange={handleInputChange} className="input-campo" />
                          <label className="editor-label">Sesiones por Semana</label><input name="numero_sesiones_por_semana" type="number" value={temario.numero_sesiones_por_semana || ''} onChange={handleInputChange} className="input-campo" />
                          <label className="editor-label">Porcentaje Teoría</label><input name="porcentaje_teoria" type="number" value={temario.porcentaje_teoria || ''} onChange={handleInputChange} className="input-campo" placeholder="30" />
                          <label className="editor-label">Porcentaje Práctica</label><input name="porcentaje_practica" type="number" value={temario.porcentaje_practica || ''} onChange={handleInputChange} className="input-campo" placeholder="70" />
                          <label className="editor-label">Descripción General</label><textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-descripcion" />
                          <label className="editor-label">Objetivos Generales</label><textarea name="objetivos_generales" value={Array.isArray(temario.objetivos_generales) ? temario.objetivos_generales.join('\n') : (temario.objetivos_generales || '')} onChange={handleInputChange} className="textarea-descripcion" placeholder="Lista los objetivos principales del curso, uno por línea" />
                          <h3>Temario Detallado</h3>
                          {(temario.temario || []).map((cap, capIndex) => (
                              <div key={capIndex} className="capitulo-editor">
                                  <div className="capitulo-header">
                                    <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, null, e.target.value)} className="input-capitulo" placeholder="Nombre del capítulo"/>
                                    <button
                                      type="button"
                                      className="delete-btn"
                                      onClick={() => eliminarCapitulo(capIndex)}
                                      title="Eliminar capítulo"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  
                                  <div className="capitulo-info-grid">
                                    <div className="field-group">
                                      <label>Duración Total (min):</label>
                                      <input
                                        type="number"
                                        value={cap.tiempo_capitulo_min || ''}
                                        onChange={(e) => {
                                          const nuevoTemario = JSON.parse(JSON.stringify(temario));
                                          nuevoTemario.temario[capIndex].tiempo_capitulo_min = parseInt(e.target.value) || 0;
                                          setTemario(nuevoTemario);
                                        }}
                                        placeholder="180"
                                        min="30"
                                        max="480"
                                      />
                                    </div>
                                    <div className="field-group">
                                      <label>Distribución Teoría/Práctica:</label>
                                      <input
                                        type="text"
                                        value={cap.porcentaje_teoria_practica_capitulo || ''}
                                        onChange={(e) => {
                                          const nuevoTemario = JSON.parse(JSON.stringify(temario));
                                          nuevoTemario.temario[capIndex].porcentaje_teoria_practica_capitulo = e.target.value;
                                          setTemario(nuevoTemario);
                                        }}
                                        placeholder="60% Teoría / 40% Práctica"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div className="objetivos-capitulo">
                                    <label>Objetivos del Capítulo:</label>
                                    <textarea
                                      value={Array.isArray(cap.objetivos_capitulo) ? cap.objetivos_capitulo.join('\n') : (cap.objetivos_capitulo || '')}
                                      onChange={(e) => {
                                        const nuevoTemario = JSON.parse(JSON.stringify(temario));
                                        nuevoTemario.temario[capIndex].objetivos_capitulo = e.target.value.split('\n').filter(line => line.trim());
                                        setTemario(nuevoTemario);
                                      }}
                                      placeholder="Lista los objetivos específicos de este capítulo, uno por línea"
                                      rows="3"
                                    />
                                  </div>
                                  
                                  <h4>Subcapítulos</h4>
                                  <ul>
                                      {(cap.subcapitulos || []).map((sub, subIndex) => {
                        const subData = typeof sub === 'object' ? sub : { 
                          nombre: sub, 
                          sesion: 1, 
                          tiempo_subcapitulo_min: 30, 
                          tipo: 'teoria', 
                          entregable: '' 
                        };
                        
                        return (
                          <div key={subIndex} className="subcapitulo-item">
                            <div className="subcapitulo-header">
                              <h5>Subcapítulo {subIndex + 1}</h5>
                              <button
                                type="button"
                                className="delete-btn"
                                onClick={() => eliminarSubcapitulo(capIndex, subIndex)}
                                title="Eliminar subcapítulo"
                              >
                                ×
                              </button>
                            </div>
                            
                            <div className="subcapitulo-fields">
                              <div className="field-group">
                                <label>Nombre del subcapítulo:</label>
                                <input
                                  type="text"
                                  value={subData.nombre || ''}
                                  onChange={(e) => handleTemarioChange(capIndex, subIndex, 'nombre', e.target.value)}
                                  placeholder="Nombre del subcapítulo..."
                                />
                              </div>

                              <div className="field-row">
                                <div className="field-group">
                                  <label>Sesión:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={subData.sesion || 1}
                                    onChange={(e) => handleTemarioChange(capIndex, subIndex, 'sesion', parseInt(e.target.value) || 1)}
                                  />
                                </div>

                                <div className="field-group">
                                  <label>Duración (min):</label>
                                  <input
                                    type="number"
                                    min="5"
                                    max="480"
                                    step="5"
                                    value={subData.tiempo_subcapitulo_min || 30}
                                    onChange={(e) => handleTemarioChange(capIndex, subIndex, 'tiempo_subcapitulo_min', parseInt(e.target.value) || 30)}
                                  />
                                </div>

                                <div className="field-group">
                                  <label>Tipo:</label>
                                  <select
                                    value={subData.tipo || 'teoria'}
                                    onChange={(e) => handleTemarioChange(capIndex, subIndex, 'tipo', e.target.value)}
                                  >
                                    <option value="teoria">Teoría</option>
                                    <option value="practica">Práctica</option>
                                    <option value="laboratorio">Laboratorio</option>
                                  </select>
                                </div>
                              </div>

                              <div className="field-group">
                                <label>Entregable:</label>
                                <input
                                  type="text"
                                  value={subData.entregable || ''}
                                  onChange={(e) => handleTemarioChange(capIndex, subIndex, 'entregable', e.target.value)}
                                  placeholder="Descripción del entregable (opcional)..."
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                                  </ul>
                                  <button 
                                    type="button" 
                                    className="add-subcapitulo-btn"
                                    onClick={() => agregarSubcapitulo(capIndex)}
                                  >
                                    + Agregar Subcapítulo
                                  </button>
                              </div>
                          ))}
                          <button 
                            type="button" 
                            className="add-capitulo-btn"
                            onClick={agregarCapitulo}
                          >
                            + Agregar Capítulo
                          </button>
                      </div>
                  ) : (
                      <div className="vista-resumida-editable">
                          <input name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo-resumido" placeholder="Nombre del curso" />
                          
                          <div className="info-grid">
                            <input name="sector" value={temario.sector || ''} onChange={handleInputChange} placeholder="Sector" />
                            <select name="nivel" value={temario.nivel || ''} onChange={handleInputChange}>
                              <option value="">Nivel</option>
                              <option value="basico">Básico</option>
                              <option value="intermedio">Intermedio</option>
                              <option value="avanzado">Avanzado</option>
                            </select>
                            <input name="horas_por_sesion" type="number" value={temario.horas_por_sesion || ''} onChange={handleInputChange} placeholder="Horas/sesión" />
                            <input name="numero_sesiones_por_semana" type="number" value={temario.numero_sesiones_por_semana || ''} onChange={handleInputChange} placeholder="Sesiones/semana" />
                            <input name="porcentaje_teoria" type="number" value={temario.porcentaje_teoria || ''} onChange={handleInputChange} placeholder="% Teoría" />
                            <input name="porcentaje_practica" type="number" value={temario.porcentaje_practica || ''} onChange={handleInputChange} placeholder="% Práctica" />
                          </div>
                          
                          <div className="seccion-editable">
                            <label>Descripción General:</label>
                            <textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} placeholder="Descripción del curso..." rows="3" />
                            
                            <label>Objetivos Generales:</label>
                            <textarea name="objetivos_generales" value={Array.isArray(temario.objetivos_generales) ? temario.objetivos_generales.join('\n') : (temario.objetivos_generales || '')} onChange={handleInputChange} placeholder="Objetivos del curso, uno por línea..." rows="4" />
                          </div>
                          
                          <h3>Temario Detallado</h3>
                          {(temario.temario || []).map((cap, capIndex) => (
                              <div key={capIndex} className="capitulo-resumido">
                                  <div className="capitulo-header-resumido">
                                    <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, null, e.target.value)} className="input-capitulo-resumido" placeholder="Nombre del capítulo"/>
                                    <button
                                      type="button"
                                      className="delete-btn-small"
                                      onClick={() => eliminarCapitulo(capIndex)}
                                      title="Eliminar capítulo"
                                    >
                                      ×
                                    </button>
                                  </div>
                                  
                                  <div className="info-grid-capitulo">
                                    <input
                                      type="number"
                                      value={cap.tiempo_capitulo_min || ''}
                                      onChange={(e) => {
                                        const nuevoTemario = JSON.parse(JSON.stringify(temario));
                                        nuevoTemario.temario[capIndex].tiempo_capitulo_min = parseInt(e.target.value) || 0;
                                        setTemario(nuevoTemario);
                                      }}
                                      placeholder="Duración (min)"
                                      min="30"
                                      max="480"
                                    />
                                    <input
                                      type="text"
                                      value={cap.porcentaje_teoria_practica_capitulo || ''}
                                      onChange={(e) => {
                                        const nuevoTemario = JSON.parse(JSON.stringify(temario));
                                        nuevoTemario.temario[capIndex].porcentaje_teoria_practica_capitulo = e.target.value;
                                        setTemario(nuevoTemario);
                                      }}
                                      placeholder="% T/P"
                                    />
                                  </div>
                                  
                                  <div className="objetivos-capitulo-resumido">
                                    <textarea
                                      value={Array.isArray(cap.objetivos_capitulo) ? cap.objetivos_capitulo.join('\n') : (cap.objetivos_capitulo || '')}
                                      onChange={(e) => {
                                        const nuevoTemario = JSON.parse(JSON.stringify(temario));
                                        nuevoTemario.temario[capIndex].objetivos_capitulo = e.target.value.split('\n').filter(line => line.trim());
                                        setTemario(nuevoTemario);
                                      }}
                                      placeholder="Objetivos del capítulo..."
                                      rows="2"
                                    />
                                  </div>
                                  
                                  <div className="subcapitulos-resumidos">
                                      {(cap.subcapitulos || []).map((sub, subIndex) => {
                                        const subData = typeof sub === 'object' ? sub : { 
                                          nombre: sub, 
                                          sesion: 1, 
                                          tiempo_subcapitulo_min: 30, 
                                          tipo: 'teoria', 
                                          entregable: '' 
                                        };
                                        
                                        return (
                                          <div key={subIndex} className="subcapitulo-resumido">
                                            <input
                                              type="text"
                                              value={subData.nombre || ''}
                                              onChange={(e) => handleTemarioChange(capIndex, subIndex, 'nombre', e.target.value)}
                                              placeholder="Nombre del subcapítulo..."
                                              className="input-subcapitulo-resumido"
                                            />
                                            <div className="subcapitulo-meta">
                                              <input
                                                type="number"
                                                value={subData.sesion || 1}
                                                onChange={(e) => handleTemarioChange(capIndex, subIndex, 'sesion', parseInt(e.target.value) || 1)}
                                                min="1"
                                                max="50"
                                                className="input-sesion"
                                                title="Sesión"
                                              />
                                              <input
                                                type="number"
                                                value={subData.tiempo_subcapitulo_min || 30}
                                                onChange={(e) => handleTemarioChange(capIndex, subIndex, 'tiempo_subcapitulo_min', parseInt(e.target.value) || 30)}
                                                min="5"
                                                max="480"
                                                step="5"
                                                className="input-tiempo"
                                                title="Duración en minutos"
                                              />
                                              <select
                                                value={subData.tipo || 'teoria'}
                                                onChange={(e) => handleTemarioChange(capIndex, subIndex, 'tipo', e.target.value)}
                                                className="select-tipo"
                                                title="Tipo de actividad"
                                              >
                                                <option value="teoria">T</option>
                                                <option value="practica">P</option>
                                                <option value="laboratorio">L</option>
                                              </select>
                                            </div>
                                            <input
                                              type="text"
                                              value={subData.entregable || ''}
                                              onChange={(e) => handleTemarioChange(capIndex, subIndex, 'entregable', e.target.value)}
                                              placeholder="Entregable..."
                                              className="input-entregable"
                                            />
                                            <button
                                              type="button"
                                              className="delete-btn-small"
                                              onClick={() => eliminarSubcapitulo(capIndex, subIndex)}
                                              title="Eliminar"
                                            >
                                              ×
                                            </button>
                                          </div>
                                        );
                                      })}
                                      <button 
                                        type="button" 
                                        className="add-subcapitulo-btn"
                                        onClick={() => agregarSubcapitulo(capIndex)}
                                      >
                                        + Subcapítulo
                                      </button>
                                  </div>
                              </div>
                          ))}
                          <button 
                            type="button" 
                            className="add-capitulo-btn"
                            onClick={agregarCapitulo}
                          >
                            + Agregar Capítulo
                          </button>
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
        <div className="regenerar-form">
          <h3>Ajustar Parámetros y Regenerar</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Tecnología</label>
              <input name="tecnologia" value={params.tecnologia} onChange={handleParamsChange} />
            </div>
            <div className="form-group">
              <label>Tema del Curso</label>
              <input name="tema_curso" value={params.tema_curso} onChange={handleParamsChange} />
            </div>
            <div className="form-group">
              <label>Sector</label>
              <input name="sector" value={params.sector} onChange={handleParamsChange} placeholder="Ej: Bancario, Educativo, Salud" />
            </div>
            <div className="form-group">
              <label>Nivel de Dificultad</label>
              <select name="nivel_dificultad" value={params.nivel_dificultad} onChange={handleParamsChange}>
                <option value="basico">Básico</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>
            <div className="form-group">
              <label>Objetivo del Curso</label>
              <select name="objetivo_tipo" value={params.objetivo_tipo} onChange={handleParamsChange}>
                <option value="saber_hacer">Saber Hacer</option>
                <option value="certificacion">Certificación</option>
              </select>
            </div>
            <div className="form-group">
              <label>Horas por Sesión</label>
              <input name="horas_por_sesion" type="number" min="4" max="12" value={params.horas_por_sesion} onChange={handleParamsChange} />
            </div>
            <div className="form-group">
              <label>Sesiones por Semana</label>
              <input name="numero_sesiones_por_semana" type="number" min="1" max="7" value={params.numero_sesiones_por_semana} onChange={handleParamsChange} />
              <small className="help-text">1-2 sesiones generan 3 capítulos, 3+ sesiones generan N capítulos</small>
            </div>
          </div>
          
          {params.objetivo_tipo === 'certificacion' && (
            <div className="form-group">
              <label>Código de Certificación</label>
              <input name="codigo_certificacion" value={params.codigo_certificacion} onChange={handleParamsChange} placeholder="Ej: AWS-SAA-C03" />
            </div>
          )}
          
          <div className="form-group">
            <label>Enfoque Adicional (Opcional)</label>
            <textarea name="enfoque" value={params.enfoque} onChange={handleParamsChange} />
          </div>
          
          <div className="form-group">
            <label>Nivel de Bloom Personalizado (Opcional)</label>
            <input name="bloom_level_override" value={params.bloom_level_override} onChange={handleParamsChange} placeholder="Ej: Niveles 3-4" />
          </div>
          
          <div className="form-actions">
            <button onClick={handleRegenerateClick} disabled={isLoading}>
              {isLoading ? 'Regenerando...' : 'Regenerar Temario'}
            </button>
            <button onClick={() => setMostrarFormRegenerar(false)}>Cancelar</button>
          </div>
        </div>
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





