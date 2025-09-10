// src/components/EditorDeTemario.jsx (CÓDIGO COMPLETO Y FUNCIONAL + EXPORT/VER VERSIONES)

import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';
import './EditorDeTemario.css';

/* ====== utilidades mínimas, no rompen nada ====== */
const slugify = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'curso';

/** Exporta un CSV (abre en Excel) SIN librerías externas */
function exportTemarioToCSV(temario, fileBase = 'temario') {
  if (!temario) return;
  const rows = [];

  const add = (k, v) => rows.push([k, v ?? '']);

  add('Nombre del curso', temario.nombre_curso);
  add('Versión tecnología', temario.version_tecnologia);
  add('Horas totales', temario.horas_totales);
  add('Número de sesiones', temario.numero_sesiones);
  add('EOL', temario.EOL);
  add('Distribución general', temario.porcentaje_teoria_practica_general);
  add('Descripción general', temario.descripcion_general);
  add('Audiencia', temario.audiencia);
  add('Prerrequisitos', temario.prerrequisitos);
  add('Objetivos', temario.objetivos);

  (temario.temario || []).forEach((cap, i) => {
    add(`Capítulo ${i + 1}`, cap?.capitulo);
    add(`Capítulo ${i + 1} - Duración (min)`, cap?.tiempo_capitulo_min);
    add(`Capítulo ${i + 1} - Teoría/Práctica`, cap?.porcentaje_teoria_practica_capitulo);

    const objetivosCap =
      Array.isArray(cap?.objetivos_capitulo)
        ? cap.objetivos_capitulo.join(' | ')
        : cap?.objetivos_capitulo || '';
    add(`Capítulo ${i + 1} - Objetivos`, objetivosCap);

    (cap?.subcapitulos || []).forEach((sub, j) => {
      const nombre = typeof sub === 'object' ? sub?.nombre : sub;
      const min = typeof sub === 'object' ? sub?.tiempo_subcapitulo_min : '';
      const sesion = typeof sub === 'object' ? sub?.sesion : '';
      add(`  Sub ${i + 1}.${j + 1}`, nombre);
      if (min !== '' || sesion !== '') {
        add(`  Sub ${i + 1}.${j + 1} - min`, min);
        add(`  Sub ${i + 1}.${j + 1} - sesión`, sesion);
      }
    });
  });

  const csv =
    rows
      .map((r) =>
        r
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      )
      .join('\r\n') + '\r\n';

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${fileBase}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada'); // Inicia en la vista editable
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);

  // NUEVO: controles de export y versiones
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const apiBaseRef = useRef(
    // usa variable global o .env si existen; si no, pedimos por prompt al abrir versiones
    (typeof window !== 'undefined' && window.__TEMARIOS_API_BASE) ||
      (import.meta?.env?.VITE_TEMARIOS_API || '')
  );

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
    // También actualizamos los params por si se regenera
    setParams({
      tecnologia: temarioInicial?.version_tecnologia || '',
      tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
      extension_curso_dias: temarioInicial?.numero_sesiones || 1,
      nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
      audiencia: temarioInicial?.audiencia || '',
      enfoque: temarioInicial?.enfoque || ''
    });
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
    onRegenerate(params);
    setMostrarFormRegenerar(false);
  };

  const handleSaveClick = () => {
    onSave(temario);
  };

  // Función para exportar PDF (sin cambios)
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

  // NUEVO: Exportar CSV para Excel
  const exportarCSV = () => {
    const cursoId = temario?.cursoId || temario?.curso_slug || slugify(temario?.tema_curso || temario?.nombre_curso || 'curso');
    exportTemarioToCSV(temario, `temario_${cursoId}`);
    setShowExportMenu(false);
  };

  // NUEVO: Abrir modal y cargar versiones
  const abrirModalVersiones = async () => {
    try {
      let base = apiBaseRef.current;
      if (!base) {
        base = window.prompt('URL base del API de temarios (por ej. https://XXXX.execute-api.REGION.amazonaws.com/prod)');
        if (!base) return;
        apiBaseRef.current = base;
      }
      const cursoId = temario?.cursoId || temario?.curso_slug || slugify(temario?.tema_curso || temario?.nombre_curso || 'curso');
      setShowVersionsModal(true);
      setLoadingVersions(true);

      const resp = await fetch(`${base}/temarios/${encodeURIComponent(cursoId)}/versions`);
      const data = await resp.json();
      const list = Array.isArray(data) ? data : (data?.body ? JSON.parse(data.body) : []);
      setVersions(list || []);
    } catch (e) {
      console.error(e);
      setVersions([]);
      setShowVersionsModal(true);
    } finally {
      setLoadingVersions(false);
    }
  };

  // NUEVO: Descargar una versión en JSON
  const descargarVersion = async (v) => {
    try {
      let base = apiBaseRef.current;
      if (!base) {
        base = window.prompt('URL base del API de temarios (por ej. https://XXXX.execute-api.REGION.amazonaws.com/prod)');
        if (!base) return;
        apiBaseRef.current = base;
      }
      // Intentamos inferir courseId del s3Key: temarios/<cursoId>.json
      const s3Key = v?.s3Key || '';
      const guessedId = s3Key.split('/').pop()?.replace('.json', '') || '';
      const cursoId = temario?.cursoId || temario?.curso_slug || guessedId || slugify(temario?.tema_curso || temario?.nombre_curso || 'curso');

      const url = `${base}/temarios/${encodeURIComponent(cursoId)}/versions/${encodeURIComponent(v.versionId)}`;
      const resp = await fetch(url);
      const payload = await resp.json();
      const body = typeof payload === 'string'
        ? JSON.parse(payload)
        : (payload?.body ? JSON.parse(payload.body) : payload);

      const blob = new Blob([JSON.stringify(body, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${cursoId}-${v.versionId}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      console.error(e);
      alert('No se pudo descargar la versión seleccionada.');
    }
  };

  if (!temario) {
    // Mantengo tu comportamiento de retorno nulo,
    // pero si prefieres, muestra un aviso no intrusivo:
    return (
      <div className="editor-container">
        <div className="vista-info">
          <p>⚠️ No hay datos del temario para mostrar.</p>
        </div>
      </div>
    );
  }

  const cursoId = temario?.cursoId || temario?.curso_slug || slugify(temario?.tema_curso || temario?.nombre_curso || 'curso');

  return (
    <div className="editor-container">
      {/* NUEVO: barra superior con título + acciones (opcional mantener solo el selector si así lo prefieres) */}
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
          {vista === 'detallada' ? (
            // --- VISTA DETALLADA Y EDITABLE --- (SIN CAMBIOS)
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
                  <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo" placeholder="Nombre del capítulo" />

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
                        <input value={typeof sub === 'object' ? sub.nombre : sub} onChange={(e) => handleTemarioChange(capIndex, subIndex, e.target.value)} className="input-subcapitulo" placeholder="Nombre del subcapítulo" />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            // --- VISTA RESUMIDA TAMBIÉN EDITABLE --- (SIN CAMBIOS)
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
                  <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo-resumido" placeholder="Nombre del capítulo" />

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
      )}

      {/* === ACCIONES === */}
      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar(prev => !prev)}>Ajustar y Regenerar</button>
        <button onClick={handleSaveClick} className="btn-guardar">Guardar Versión</button>

        {/* NUEVO: dropdown Exportar */}
        <div className="export-dropdown">
          <button
            className="btn-exportar"
            onClick={() => setShowExportMenu((s) => !s)}
          >
            Exportar ▾
          </button>
          {showExportMenu && (
            <div className="export-menu">
              <button onClick={() => { setShowExportMenu(false); exportarPDF(); }}>PDF</button>
              <button onClick={exportarCSV}>Excel (CSV)</button>
            </div>
          )}
        </div>

        {/* NUEVO: Ver versiones */}
        <button onClick={abrirModalVersiones} className="btn-ver-versiones">Ver versiones</button>
      </div>

      {/* === FORM DE REGENERACIÓN (igual que el tuyo) === */}
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

      {/* === MODAL DE VERSIONES (NUEVO) === */}
      {showVersionsModal && (
        <div className="modal-backdrop" onClick={() => setShowVersionsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>📁 Versiones guardadas — <small>{cursoId}</small></h3>

            {loadingVersions ? (
              <div className="spinner" />
            ) : versions?.length ? (
              <div className="versiones-lista">
                {versions.map((v, idx) => (
                  <div key={`${v.versionId}-${idx}`} className="version-item">
                    <div className="version-info">
                      <div><strong>versionId:</strong> {v.versionId}</div>
                      <div><strong>fecha:</strong> {new Date(v.createdAt || v.LastModified || Date.now()).toLocaleString()}</div>
                      {v.nota && <div><strong>nota:</strong> {String(v.nota).replace(/^=\?UTF-8\?Q\?|\?=$/g,'')}</div>}
                      {v.size != null && <div><strong>tamaño:</strong> {v.size} bytes</div>}
                    </div>
                    <div className="version-actions">
                      <button onClick={() => descargarVersion(v)}>Descargar JSON</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay versiones registradas o no se pudieron cargar.</p>
            )}

            <div className="modal-actions">
              <button onClick={() => setShowVersionsModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorDeTemario;


