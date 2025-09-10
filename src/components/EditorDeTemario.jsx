// src/components/EditorDeTemario.jsx (CÓDIGO COMPLETO Y FUNCIONAL)

import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './EditorDeTemario.css';

/**
 * Props:
 * - temarioInicial: objeto del temario (lo que ya usas)
 * - onRegenerate(params): función que regenera con parámetros
 * - onSave(temario): guarda una versión en tu backend
 * - isLoading: boolean para spinner
 * - onFetchVersions?: async (cursoId) => [{versionId, createdAt, size, autorEmail, nota, isLatest}]
 *   Si no la pasas, el modal mostrará "No hay versiones..."
 */
function EditorDeTemario({
  temarioInicial,
  onRegenerate,
  onSave,
  isLoading,
  onFetchVersions
}) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada');
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);

  // Export / Modal
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionsError, setVersionsError] = useState('');

  // Ref PDF
  const pdfTargetRef = useRef(null);

  // Parámetros para regenerar (se “sincronizan” con temarioInicial)
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
    setParams({
      tecnologia: temarioInicial?.version_tecnologia || '',
      tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
      extension_curso_dias: temarioInicial?.numero_sesiones || 1,
      nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
      audiencia: temarioInicial?.audiencia || '',
      enfoque: temarioInicial?.enfoque || ''
    });
  }, [temarioInicial]);

  // Handlers edición directa
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemario(prev => ({ ...prev, [name]: value }));
  };

  const handleTemarioChange = (capIndex, subIndex, value) => {
    const nuevo = JSON.parse(JSON.stringify(temario));
    if (subIndex === null) {
      nuevo.temario[capIndex].capitulo = value;
    } else {
      if (typeof nuevo.temario[capIndex].subcapitulos[subIndex] === 'object') {
        nuevo.temario[capIndex].subcapitulos[subIndex].nombre = value;
      } else {
        nuevo.temario[capIndex].subcapitulos[subIndex] = value;
      }
    }
    setTemario(nuevo);
  };

  // Regenerar / Guardar
  const handleParamsChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleRegenerateClick = () => {
    onRegenerate?.(params);
    setMostrarFormRegenerar(false);
  };

  const handleSaveClick = () => {
    onSave?.(temario);
  };

  // Exportar PDF
  const exportarPDF = () => {
    if (!pdfTargetRef.current) return;
    const titulo = temario?.nombre_curso || 'temario';
    const filename = `temario_${String(titulo).replace(/\s+/g, '_')}_${vista}.pdf`;

    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      })
      .from(pdfTargetRef.current)
      .save();
  };

  // Exportar Excel (dinámico con fallback CSV)
  const exportarExcel = async () => {
    try {
      const { downloadExcelTemario } = await import('../utils/downloadExcel');
      await downloadExcelTemario(temario);
    } catch {
      alert('La exportación a Excel no está disponible en este build.');
    }
  };

  // Modal "Ver versiones"
  const cursoIdPorDefecto = () => {
    const raw = temario?.tema_curso || temario?.nombre_curso || 'curso';
    return String(raw).toLowerCase().trim().replace(/\s+/g, '-');
  };

  const abrirModalVersiones = async () => {
    setShowVersions(true);
    setVersions([]);
    setVersionsError('');
    if (!onFetchVersions) return; // si no hay función, dejamos mensaje vacío
    setLoadingVersions(true);
    try {
      const id = cursoIdPorDefecto();
      const list = await onFetchVersions(id);
      setVersions(Array.isArray(list) ? list : []);
    } catch (e) {
      setVersionsError('No se pudieron cargar las versiones.');
    } finally {
      setLoadingVersions(false);
    }
  };

  // cerrar dropdown si hago click fuera
  useEffect(() => {
    const close = () =>
      document.querySelectorAll('.exportar-menu.open')
        .forEach(m => m.classList.remove('open'));
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  if (!temario) return null;

  return (
    <div className="editor-container">
      {/* Selector de vista */}
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
        {vista === 'resumida'
          ? <p>📝 Vista completa con todos los campos editables organizados verticalmente</p>
          : <p>📋 Vista compacta con campos organizados en grillas para edición rápida</p>
        }
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Generando nueva versión...</p>
        </div>
      ) : (
        <div ref={pdfTargetRef}>
          {vista === 'detallada' ? (
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
                          const nuevo = JSON.parse(JSON.stringify(temario));
                          nuevo.temario[capIndex].tiempo_capitulo_min = parseInt(e.target.value) || 0;
                          setTemario(nuevo);
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
                          const nuevo = JSON.parse(JSON.stringify(temario));
                          nuevo.temario[capIndex].porcentaje_teoria_practica_capitulo = e.target.value;
                          setTemario(nuevo);
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
                        const nuevo = JSON.parse(JSON.stringify(temario));
                        const t = e.target.value;
                        if (t.includes('\n')) {
                          nuevo.temario[capIndex].objetivos_capitulo = t.split('\n').filter(s => s.trim());
                        } else {
                          nuevo.temario[capIndex].objetivos_capitulo = t;
                        }
                        setTemario(nuevo);
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

                  <div className="info-grid-capitulo">
                    <div className="info-item">
                      <label>Duración (min):</label>
                      <input
                        type="number"
                        value={cap.tiempo_capitulo_min || ''}
                        onChange={(e) => {
                          const nuevo = JSON.parse(JSON.stringify(temario));
                          nuevo.temario[capIndex].tiempo_capitulo_min = parseInt(e.target.value) || 0;
                          setTemario(nuevo);
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
                          const nuevo = JSON.parse(JSON.stringify(temario));
                          nuevo.temario[capIndex].porcentaje_teoria_practica_capitulo = e.target.value;
                          setTemario(nuevo);
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
                        const nuevo = JSON.parse(JSON.stringify(temario));
                        const t = e.target.value;
                        if (t.includes('\n')) {
                          nuevo.temario[capIndex].objetivos_capitulo = t.split('\n').filter(s => s.trim());
                        } else {
                          nuevo.temario[capIndex].objetivos_capitulo = t;
                        }
                        setTemario(nuevo);
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
                              const nuevo = JSON.parse(JSON.stringify(temario));
                              if (typeof nuevo.temario[capIndex].subcapitulos[subIndex] === 'object') {
                                nuevo.temario[capIndex].subcapitulos[subIndex].tiempo_subcapitulo_min = parseInt(e.target.value) || 0;
                              } else {
                                nuevo.temario[capIndex].subcapitulos[subIndex] = {
                                  nombre: nuevo.temario[capIndex].subcapitulos[subIndex],
                                  tiempo_subcapitulo_min: parseInt(e.target.value) || 0
                                };
                              }
                              setTemario(nuevo);
                            }}
                            className="input-tiempo-sub"
                            placeholder="min"
                          />
                          <input
                            type="number"
                            value={typeof sub === 'object' ? sub.sesion || '' : ''}
                            onChange={(e) => {
                              const nuevo = JSON.parse(JSON.stringify(temario));
                              if (typeof nuevo.temario[capIndex].subcapitulos[subIndex] === 'object') {
                                nuevo.temario[capIndex].subcapitulos[subIndex].sesion = parseInt(e.target.value) || 0;
                              } else {
                                nuevo.temario[capIndex].subcapitulos[subIndex] = {
                                  nombre: nuevo.temario[capIndex].subcapitulos[subIndex],
                                  sesion: parseInt(e.target.value) || 0
                                };
                              }
                              setTemario(nuevo);
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
      )}

      {/* Botonera inferior */}
      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar(prev => !prev)}>Ajustar y Regenerar</button>
        <button onClick={handleSaveClick} className="btn-guardar">Guardar Versión</button>

        {/* Exportar (dropdown vertical) */}
        <div className="exportar-group">
          <button
            type="button"
            className="btn-exportar exportar-trigger"
            onClick={(e) => {
              e.stopPropagation();
              const menu = e.currentTarget.parentElement.querySelector('.exportar-menu');
              menu.classList.toggle('open');
            }}
          >
            Exportar ▾
          </button>

          <div className="exportar-menu" onClick={(e)=>e.stopPropagation()}>
            <button className="exportar-item" onClick={() => {
              document.querySelector('.exportar-menu')?.classList.remove('open');
              exportarPDF();
            }}>Exportar a PDF</button>

            <button className="exportar-item" onClick={async () => {
              document.querySelector('.exportar-menu')?.classList.remove('open');
              await exportarExcel();
            }}>Exportar a Excel</button>
          </div>
        </div>

        <button onClick={abrirModalVersiones} className="btn-ver-versiones">Ver versiones</button>
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

      {/* Modal Versiones */}
      {showVersions && (
        <div className="modal-overlay" onClick={() => setShowVersions(false)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-title">
              <span>📁 Versiones guardadas — <em>{cursoIdPorDefecto()}</em></span>
            </div>

            <div className="modal-body">
              {loadingVersions && <p>Cargando versiones…</p>}
              {!loadingVersions && versionsError && <p className="error-text">{versionsError}</p>}

              {!loadingVersions && !versionsError && (
                versions.length > 0 ? (
                  <ul className="lista-versiones">
                    {versions.map(v => (
                      <li key={v.versionId}>
                        <div className="ver-item-title">
                          <strong>vID:</strong> {v.versionId}
                          {v.isLatest ? <span className="badge-latest">última</span> : null}
                        </div>
                        <div className="ver-item-meta">
                          <span>{new Date(v.createdAt).toLocaleString()}</span>
                          {typeof v.size === 'number' ? <span> · {v.size} bytes</span> : null}
                          {v.autorEmail ? <span> · {v.autorEmail}</span> : null}
                        </div>
                        {v.nota ? <div className="ver-item-nota">📝 {v.nota}</div> : null}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay versiones registradas o no se pudieron cargar.</p>
                )
              )}
            </div>

            <div className="modal-actions">
              <button className="btn-cerrar" onClick={() => setShowVersions(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorDeTemario;



