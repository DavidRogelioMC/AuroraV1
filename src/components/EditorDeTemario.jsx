// src/components/EditorDeTemario.jsx (CÓDIGO COMPLETO Y FUNCIONAL)

import React, { useState, useEffect, useRef } from "react";
import html2pdf from "html2pdf.js";
import { downloadExcelTemario } from "../utils/downloadExcel";
import netecLogo from "../assets/Netec.png";
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

// Funciones utilitarias para PDF profesional
const toDataURL = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.readAsDataURL(blob);
  });
};

const makeTranslucent = async (srcDataUrl, alpha = 0.06) => {
  const img = await new Promise((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.src = srcDataUrl;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
};

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada'); // Inicia en la vista editable
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);
  
  // Nuevos estados para funcionalidades avanzadas
  const [guardando, setGuardando] = useState(false);
  const [errorUi, setErrorUi] = useState("");
  const [okUi, setOkUi] = useState("");
  const [modalVersiones, setModalVersiones] = useState(false);
  const [versiones, setVersiones] = useState([]);
  const [cargandoVersiones, setCargandoVersiones] = useState(false);
  const [modalExportar, setModalExportar] = useState(false);
  const [exportTipo, setExportTipo] = useState("pdf");
  const [seleccionadas, setSeleccionadas] = useState({});

  // Ref para el área a exportar en PDF
  const pdfTargetRef = useRef(null);

  // Estado para los parámetros de re-generación. Se inicializa con los datos del temario actual.
  const [params, setParams] = useState({
    tecnologia: temarioInicial?.version_tecnologia || '',
    tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
    extension_curso_dias: temarioInicial?.numero_sesiones || 1,
    nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
    audiencia: temarioInicial?.audiencia || '',
    enfoque: temarioInicial?.enfoque || ''
  });

  // Efecto para actualizar el temario si la prop `temarioInicial` cambia
  useEffect(() => {
    setTemario(temarioInicial);
  }, [temarioInicial]);

  // --- MANEJADORES DE EDICIÓN DIRECTA ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemario(prev => ({ ...prev, [name]: value }));
  };

  const handleTemarioChange = (capIndex, subIndex, value) => {
    const nuevoTemario = JSON.parse(JSON.stringify(temario)); // Deep copy para evitar mutaciones
    if (subIndex === null) {
      nuevoTemario.temario[capIndex].capitulo = value;
    } else {
      // Maneja ambos formatos de subcapítulos (string u objeto)
      if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex].nombre = value;
      } else {
        nuevoTemario.temario[capIndex].subcapitulos[subIndex] = value;
      }
    }
    setTemario(nuevoTemario);
  };

  // --- MANEJADORES DE RE-GENERACIÓN Y GUARDADO ---
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

  // Función para exportar PDF profesional con marca de agua y estructura corporativa
  const exportarPDF = () => {
    const elemento = pdfRef.current;
    if (!elemento) return;

    // Agregar clase para hacer visible el contenido durante la exportación
    elemento.classList.add('pdf-exporting');

    // Configuración para el PDF con marca de agua
    const options = {
      margin: [10, 10, 20, 10],
      filename: `Temario_${temario.codigo || 'documento'}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    html2pdf()
      .from(elemento)
      .set(options)
      .toPdf()
      .get('pdf')
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        
        // Agregar marca de agua en cada página
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          
          // Marca de agua diagonal
          pdf.saveGraphicsState();
          pdf.setGState(new pdf.GState({opacity: 0.1}));
          pdf.setTextColor(200, 200, 200);
          pdf.setFontSize(50);
          
          // Rotar y posicionar la marca de agua
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();
          pdf.text('GlobalK', pageWidth/2, pageHeight/2, {
            angle: 45,
            align: 'center'
          });
          
          pdf.restoreGraphicsState();
          
          // Footer corporativo
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(
            `GlobalK S.A. de C.V. | Página ${i} de ${totalPages} | ${new Date().toLocaleDateString()}`,
            pageWidth/2,
            pageHeight - 5,
            { align: 'center' }
          );
        }
      })
      .save()
      .finally(() => {
        // Remover la clase después de la exportación
        elemento.classList.remove('pdf-exporting');
      });
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

      <div className="vista-selector">
        <button 
          className={`btn-vista ${vista === 'resumida' ? 'activo' : ''}`}
          onClick={() => setVista('resumida')}
        >
          Vista Detallada
        </button>
        <button 
          className={`btn-vista ${vista === 'detallada' ? 'activo' : ''}`}
          onClick={() => setVista('detallada')}
        >
          Vista Resumida
        </button>
      </div>
      
      <div className="vista-info">
        {vista === 'resumida' ? (
          <p>📝 Vista completa con todos los campos editables organizados verticalmente</p>
        ) : (
          <p>📋 Vista compacta con campos organizados en grillas para edición rápida</p>
        )}
      </div>

      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Generando nueva versión...</p>
        </div>
      ) : (
        <div ref={pdfTargetRef}>
          {/* Contenido estructurado para PDF */}
          <div className="pdf-clean">
            <div className="pdf-header-corp">
              <div className="header-left">
                <img src={netecLogo} alt="Netec Logo" className="header-logo-netec" />
              </div>
            </div>
            <div className="pdf-header-divider" />
            <div className="pdf-body">
              <h1 className="pdf-title">{temario?.nombre_curso || temario?.tema_curso}</h1>
              <div className="pdf-meta">
                {temario?.version_tecnologia && <div><strong>Versión:</strong> {temario.version_tecnologia}</div>}
                {temario?.horas_totales && <div><strong>Horas Totales:</strong> {temario.horas_totales}</div>}
                {temario?.numero_sesiones && <div><strong>Sesiones:</strong> {temario.numero_sesiones}</div>}
                {temario?.EOL && <div><strong>EOL:</strong> {temario.EOL}</div>}
                {temario?.porcentaje_teoria_practica_general && (
                  <div><strong>Distribución:</strong> {temario.porcentaje_teoria_practica_general}</div>
                )}
              </div>
              {temario?.descripcion_general && (
                <>
                  <h2>Descripción General</h2>
                  <p className="pdf-justify">{temario.descripcion_general}</p>
                </>
              )}
              {temario?.audiencia && (
                <>
                  <h2>Audiencia</h2>
                  <p className="pdf-justify">{temario.audiencia}</p>
                </>
              )}
              {temario?.prerrequisitos && (
                <>
                  <h2>Prerrequisitos</h2>
                  <p className="pdf-justify">{temario.prerrequisitos}</p>
                </>
              )}
              {temario?.objetivos && (
                <>
                  <h2>Objetivos</h2>
                  <p className="pdf-justify" style={{ whiteSpace: 'pre-wrap' }}>{temario.objetivos}</p>
                </>
              )}
              <div className="html2pdf__page-break" />
              <h2>Temario</h2>
              {(temario?.temario || []).map((cap, i) => (
                <div key={i} className="pdf-capitulo">
                  <h3>{cap.capitulo}</h3>
                  {(cap.tiempo_capitulo_min || cap.porcentaje_teoria_practica_capitulo) && (
                    <div className="pdf-cap-meta">
                      {cap.tiempo_capitulo_min ? <span><strong>Duración:</strong> {cap.tiempo_capitulo_min} min</span> : null}
                      {cap.tiempo_capitulo_min && cap.porcentaje_teoria_practica_capitulo ? <span> • </span> : null}
                      {cap.porcentaje_teoria_practica_capitulo ? (
                        <span><strong>Distribución:</strong> {cap.porcentaje_teoria_practica_capitulo}</span>
                      ) : null}
                    </div>
                  )}
                  {cap.objetivos_capitulo && (
                    <div className="pdf-objetivos-cap">
                      <strong>Objetivos:</strong>
                      <div className="pdf-objetivos-lista">
                        {Array.isArray(cap.objetivos_capitulo) 
                          ? cap.objetivos_capitulo.map((obj, idx) => (
                              <div key={idx} className="pdf-objetivo-item">• {obj}</div>
                            ))
                          : <div className="pdf-objetivo-item">• {cap.objetivos_capitulo}</div>
                        }
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
                          {(t || s) && (
                            <span className="pdf-sub-meta">
                              {t ? `${t} min` : ''}{t && s ? ' • ' : ''}{s ? `Sesión ${s}` : ''}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Interfaz de edición visible */}
          <div className="app-view">
            {vista === 'detallada' ? (
            // --- VISTA DETALLADA Y EDITABLE ---
            <div>
          <label className="editor-label">Nombre del Curso</label>
          <textarea name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo" />
          
          <label className="editor-label">Versión de la Tecnología</label>
          <input name="version_tecnologia" value={temario.version_tecnologia || ''} onChange={handleInputChange} className="input-campo" />
          
          <label className="editor-label">Horas Totales</label>
          <input name="horas_totales" type="number" value={temario.horas_totales || ''} onChange={handleInputChange} className="input-campo" />
          
          <label className="editor-label">Número de Sesiones</label>
          <input name="numero_sesiones" type="number" value={temario.numero_sesiones || ''} onChange={handleInputChange} className="input-campo" />
          
          <label className="editor-label">EOL (Soporte)</label>
          <input name="EOL" value={temario.EOL || ''} onChange={handleInputChange} className="input-campo" placeholder="12 meses" />
          
          <label className="editor-label">Porcentaje Teoría/Práctica General</label>
          <input name="porcentaje_teoria_practica_general" value={temario.porcentaje_teoria_practica_general || ''} onChange={handleInputChange} className="input-campo" placeholder="30% Teoría / 70% Práctica" />
          
          <label className="editor-label">Descripción General</label>
          <textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-descripcion" />
          
          <label className="editor-label">Audiencia</label>
          <textarea name="audiencia" value={temario.audiencia || ''} onChange={handleInputChange} className="textarea-descripcion" />
          
          <label className="editor-label">Prerrequisitos</label>
          <textarea name="prerrequisitos" value={temario.prerrequisitos || ''} onChange={handleInputChange} className="textarea-descripcion" />
          
          <label className="editor-label">Objetivos</label>
          <textarea name="objetivos" value={temario.objetivos || ''} onChange={handleInputChange} className="textarea-descripcion" placeholder="Lista los objetivos principales del curso, separados por líneas" />

          <h3>Temario Resumido</h3>
          {(temario.temario || []).map((cap, capIndex) => (
            <div key={capIndex} className="capitulo-editor">
              <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo" placeholder="Nombre del capítulo"/>
              
              <div className="capitulo-info-grid">
                <div className="info-item">
                  <label>Duración (min):</label>
                  <input 
                    type="number" 
                    value={cap.tiempo_capitulo_min || ''} 
                    onChange={(e) => {
                      const nuevoTemario = JSON.parse(JSON.stringify(temario));
                      nuevoTemario.temario[capIndex].tiempo_capitulo_min = parseInt(e.target.value) || 0;
                      setTemario(nuevoTemario);
                    }}
                    className="input-info" 
                    placeholder="420"
                  />
                </div>
                <div className="info-item">
                  <label>Distribución Teoría/Práctica:</label>
                  <input 
                    value={cap.porcentaje_teoria_practica_capitulo || ''} 
                    onChange={(e) => {
                      const nuevoTemario = JSON.parse(JSON.stringify(temario));
                      nuevoTemario.temario[capIndex].porcentaje_teoria_practica_capitulo = e.target.value;
                      setTemario(nuevoTemario);
                    }}
                    className="input-info" 
                    placeholder="40% Teoría / 60% Práctica"
                  />
                </div>
              </div>

              <div className="objetivos-capitulo">
                <label>Objetivos del Capítulo:</label>
                <textarea 
                  value={Array.isArray(cap.objetivos_capitulo) ? cap.objetivos_capitulo.join('\n') : (cap.objetivos_capitulo || '')}
                  onChange={(e) => {
                    const nuevoTemario = JSON.parse(JSON.stringify(temario));
                    const objetivosTexto = e.target.value;
                    // Convertir a array si hay líneas separadas, sino mantener como string
                    if (objetivosTexto.includes('\n')) {
                      nuevoTemario.temario[capIndex].objetivos_capitulo = objetivosTexto.split('\n').filter(obj => obj.trim());
                    } else {
                      nuevoTemario.temario[capIndex].objetivos_capitulo = objetivosTexto;
                    }
                    setTemario(nuevoTemario);
                  }}
                  className="textarea-objetivos-capitulo" 
                  placeholder="Escribe los objetivos del capítulo, uno por línea"
                />
              </div>

              <ul>
                {(cap.subcapitulos || []).map((sub, subIndex) => (
                  <li key={subIndex}>
                    <input value={typeof sub === 'object' ? sub.nombre : sub} onChange={(e) => handleTemarioChange(capIndex, subIndex, e.target.value)} className="input-subcapitulo" placeholder="Nombre del subcapítulo"/>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        // --- VISTA RESUMIDA TAMBIÉN EDITABLE ---
        <div className="vista-resumida-editable">
          <input name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo-resumido" placeholder="Nombre del curso" />
          
          <div className="info-grid">
            <div className="info-item">
              <label>Versión:</label>
              <input name="version_tecnologia" value={temario.version_tecnologia || ''} onChange={handleInputChange} className="input-info" />
            </div>
            <div className="info-item">
              <label>Horas:</label>
              <input name="horas_totales" type="number" value={temario.horas_totales || ''} onChange={handleInputChange} className="input-info" />
            </div>
            <div className="info-item">
              <label>Sesiones:</label>
              <input name="numero_sesiones" type="number" value={temario.numero_sesiones || ''} onChange={handleInputChange} className="input-info" />
            </div>
            <div className="info-item">
              <label>EOL:</label>
              <input name="EOL" value={temario.EOL || ''} onChange={handleInputChange} className="input-info" />
            </div>
            <div className="info-item">
              <label>Distribución General:</label>
              <input name="porcentaje_teoria_practica_general" value={temario.porcentaje_teoria_practica_general || ''} onChange={handleInputChange} className="input-info" placeholder="60% Teoría / 40% Práctica" />
            </div>
          </div>

          <div className="seccion-editable">
            <h3>Descripción General</h3>
            <textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-resumido" />
          </div>

          <div className="seccion-editable">
            <h3>Audiencia</h3>
            <textarea name="audiencia" value={temario.audiencia || ''} onChange={handleInputChange} className="textarea-resumido" />
          </div>

          <div className="seccion-editable">
            <h3>Prerrequisitos</h3>
            <textarea name="prerrequisitos" value={temario.prerrequisitos || ''} onChange={handleInputChange} className="textarea-resumido" />
          </div>

          <div className="seccion-editable">
            <h3>Objetivos</h3>
            <textarea name="objetivos" value={temario.objetivos || ''} onChange={handleInputChange} className="textarea-resumido" placeholder="Lista los objetivos principales del curso, separados por líneas" />
          </div>

          <h3>Temario Detallado</h3>
          {(temario.temario || []).map((cap, capIndex) => (
            <div key={capIndex} className="capitulo-resumido">
              <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo-resumido" placeholder="Nombre del capítulo"/>
              
              {/* Grid de información del capítulo */}
              <div className="info-grid-capitulo">
                <div className="info-item">
                  <label>Duración (min):</label>
                  <input 
                    type="number" 
                    value={cap.tiempo_capitulo_min || ''} 
                    onChange={(e) => {
                      const nuevoTemario = JSON.parse(JSON.stringify(temario));
                      nuevoTemario.temario[capIndex].tiempo_capitulo_min = parseInt(e.target.value) || 0;
                      setTemario(nuevoTemario);
                    }}
                    className="input-info-small" 
                    placeholder="120"
                  />
                </div>
                <div className="info-item">
                  <label>Distribución:</label>
                  <input 
                    value={cap.porcentaje_teoria_practica_capitulo || ''} 
                    onChange={(e) => {
                      const nuevoTemario = JSON.parse(JSON.stringify(temario));
                      nuevoTemario.temario[capIndex].porcentaje_teoria_practica_capitulo = e.target.value;
                      setTemario(nuevoTemario);
                    }}
                    className="input-info-small" 
                    placeholder="70% Teoría / 30% Práctica"
                  />
                </div>
              </div>

              <div className="objetivos-capitulo-resumido">
                <label>Objetivos del Capítulo:</label>
                <textarea 
                  value={Array.isArray(cap.objetivos_capitulo) ? cap.objetivos_capitulo.join('\n') : (cap.objetivos_capitulo || '')}
                  onChange={(e) => {
                    const nuevoTemario = JSON.parse(JSON.stringify(temario));
                    const objetivosTexto = e.target.value;
                    // Convertir a array si hay líneas separadas, sino mantener como string
                    if (objetivosTexto.includes('\n')) {
                      nuevoTemario.temario[capIndex].objetivos_capitulo = objetivosTexto.split('\n').filter(obj => obj.trim());
                    } else {
                      nuevoTemario.temario[capIndex].objetivos_capitulo = objetivosTexto;
                    }
                    setTemario(nuevoTemario);
                  }}
                  className="textarea-objetivos-resumido" 
                  placeholder="Objetivos del capítulo, uno por línea"
                />
              </div>

              <div className="subcapitulos-resumidos">
                {(cap.subcapitulos || []).map((sub, subIndex) => (
                  <div key={subIndex} className="subcapitulo-item">
                    <input
                      value={typeof sub === 'object' ? sub.nombre : sub}
                      onChange={(e) => handleTemarioChange(capIndex, subIndex, e.target.value)}
                      className="input-subcapitulo-resumido"
                      placeholder="Subcapítulo"
                    />
                    <div className="subcapitulo-tiempos">
                      <input
                        type="number"
                        value={typeof sub === 'object' ? sub.tiempo_subcapitulo_min || '' : ''}
                        onChange={(e) => {
                          const nuevoTemario = JSON.parse(JSON.stringify(temario));
                          if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
                            nuevoTemario.temario[capIndex].subcapitulos[subIndex].tiempo_subcapitulo_min = parseInt(e.target.value) || 0;
                          } else {
                            nuevoTemario.temario[capIndex].subcapitulos[subIndex] = {
                              nombre: nuevoTemario.temario[capIndex].subcapitulos[subIndex],
                              tiempo_subcapitulo_min: parseInt(e.target.value) || 0
                            };
                          }
                          setTemario(nuevoTemario);
                        }}
                        className="input-tiempo-sub"
                        placeholder="min"
                      />
                      <input
                        type="number"
                        value={typeof sub === 'object' ? sub.sesion || '' : ''}
                        onChange={(e) => {
                          const nuevoTemario = JSON.parse(JSON.stringify(temario));
                          if (typeof nuevoTemario.temario[capIndex].subcapitulos[subIndex] === 'object') {
                            nuevoTemario.temario[capIndex].subcapitulos[subIndex].sesion = parseInt(e.target.value) || 0;
                          } else {
                            nuevoTemario.temario[capIndex].subcapitulos[subIndex] = {
                              nombre: nuevoTemario.temario[capIndex].subcapitulos[subIndex],
                              sesion: parseInt(e.target.value) || 0
                            };
                          }
                          setTemario(nuevoTemario);
                        }}
                        className="input-sesion-sub"
                        placeholder="sesión"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
            </div>
          )}
          </div>
        </div>
      )}

      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar(prev => !prev)}>Ajustar y Regenerar</button>
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
          <div className="form-group">
            <label>Tecnología:</label>
            <input name="tecnologia" value={params.tecnologia} onChange={handleParamsChange} placeholder="Ej: AWS Serverless, React, Python, etc." />
          </div>
          <div className="form-group">
            <label>Tema del Curso:</label>
            <input name="tema_curso" value={params.tema_curso} onChange={handleParamsChange} placeholder="Tema principal del curso" />
          </div>
          <div className="form-group">
            <label>Duración (días):</label>
            <input name="extension_curso_dias" type="number" value={params.extension_curso_dias} onChange={handleParamsChange} />
          </div>
          <div className="form-group">
            <label>Nivel de Dificultad:</label>
            <select name="nivel_dificultad" value={params.nivel_dificultad} onChange={handleParamsChange}>
              <option value="basico">Básico</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>
          </div>
          <div className="form-group">
            <label>Audiencia:</label>
            <textarea name="audiencia" value={params.audiencia} onChange={handleParamsChange} placeholder="Describe la audiencia objetivo del curso" />
          </div>
          <div className="form-group">
            <label>Enfoque (Opcional):</label>
            <textarea name="enfoque" value={params.enfoque} onChange={handleParamsChange} placeholder="Enfoque específico o características especiales del curso" />
          </div>
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




