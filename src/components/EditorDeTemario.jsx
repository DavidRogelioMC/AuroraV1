// src/components/EditorDeTemario.jsx
import React, { useState, useEffect, useRef } from 'react';
import netecLogo from '../assets/Netec.png';      
import './EditorDeTemario.css';

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada');
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);

  // Área a exportar
  const pdfRef = useRef(null);

  // Exportar PDF: SOLO la plantilla limpia (.pdf-clean)
  const exportarPDF = async () => {
    if (!pdfRef.current) return;

    const clean = pdfRef.current.querySelector('.pdf-clean');
    if (!clean) return;

    // muestra la vista limpia fuera del viewport durante la exportación
    clean.classList.add('pdf-exporting');

    try {
      const { default: html2pdf } = await import('html2pdf.js');

      const titulo = temario?.nombre_curso || temario?.tema_curso || 'temario';
      const filename = `temario_${String(titulo).replace(/\s+/g, '_')}.pdf`;

      await html2pdf()
        .set({
          margin: [12, 12, 16, 12],
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, allowTaint: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        })
        .from(clean) // << exporta SOLO la vista limpia
        .save();
    } finally {
      clean.classList.remove('pdf-exporting');
    }
  };

  // Parámetros para re-generación
  const [params, setParams] = useState({
    tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
    extension_curso_dias: temarioInicial?.numero_sesiones || 1,
    nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
    objetivos: temarioInicial?.objetivos || '',
    enfoque: temarioInicial?.enfoque || ''
  });

  // Sincroniza si cambia el temarioInicial
  useEffect(() => {
    setTemario(temarioInicial);
    setParams({
      tema_curso: temarioInicial?.tema_curso || temarioInicial?.nombre_curso || '',
      extension_curso_dias: temarioInicial?.numero_sesiones || 1,
      nivel_dificultad: temarioInicial?.nivel_dificultad || 'basico',
      objetivos: temarioInicial?.objetivos || '',
      enfoque: temarioInicial?.enfoque || ''
    });
  }, [temarioInicial]);

  // Edición directa
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

  // Regenerar / Guardar
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

  if (!temario) return null;

  return (
    <div className="editor-container">
      <div ref={pdfRef} id="temario-pdf">

        {/* ======== VISTA LIMPIA PARA PDF ======== */}
        <div className="pdf-clean">

          {/* Encabezado con banda y logo (sin ::before para que html2canvas lo pinte) */}
          <div className="pdf-topband">
            <div className="band-bg" />
            <img src={netecLogo} alt="Netec" className="pdf-logo" />
          </div>

          {/* Marca de agua */}
          <div className="pdf-watermark">
            <img src={netecLogo} alt="Watermark" className="pdf-watermark-img" />
          </div>

          {/* Cuerpo */}
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

          {/* Pie con banda */}
          <div className="pdf-bottomband">
            <div className="band-bg" />
            <div className="pdf-footer-info">www.netec.com • servicio@netec.com</div>
          </div>
        </div>
        {/* ======== FIN VISTA LIMPIA ======== */}

        {/* ======== VISTA APP (NO EXPORTA) ======== */}
        <div className="app-view">
          <div className="vista-selector">
            <button className={`btn-vista ${vista === 'detallada' ? 'activo' : ''}`} onClick={() => setVista('detallada')}>
              Vista Detallada
            </button>
            <button className={`btn-vista ${vista === 'resumida' ? 'activo' : ''}`} onClick={() => setVista('resumida')}>
              Vista Resumida
            </button>
          </div>

          <div className="vista-info">
            {vista === 'detallada'
              ? <p>📝 Vista completa con todos los campos editables organizados verticalmente</p>
              : <p>📋 Vista compacta con campos organizados en grillas para edición rápida</p>}
          </div>

          {isLoading ? (
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Generando nueva versión...</p>
            </div>
          ) : vista === 'detallada' ? (
            <div>
              <label className="editor-label">Nombre del Curso</label>
              <textarea name="nombre_curso" value={temario.nombre_curso || ''} onChange={handleInputChange} className="input-titulo" />

              <label className="editor-label">Versión de la Tecnología</label>
              <input name="version_tecnologia" value={temario.version_tecnologia || ''} onChange={handleInputChange} className="input-campo" />

              <label className="editor-label">Horas Totales</label>
              <input name="horas_totales" type="number" value={temario.horas_totales || ''} onChange={handleInputChange} className="input-campo" />

              <label className="editor-label">Número de Sesiones</label>
              <input name="numero_sesiones" type="number" value={temario.numero_sesiones || ''} onChange={handleInputChange} className="input-campo" />

              <label className="editor-label">Descripción General</label>
              <textarea name="descripcion_general" value={temario.descripcion_general || ''} onChange={handleInputChange} className="textarea-descripcion" />

              <label className="editor-label">Audiencia</label>
              <textarea name="audiencia" value={temario.audiencia || ''} onChange={handleInputChange} className="textarea-descripcion" />

              <label className="editor-label">Prerrequisitos</label>
              <textarea name="prerrequisitos" value={temario.prerrequisitos || ''} onChange={handleInputChange} className="textarea-descripcion" />

              <label className="editor-label">Objetivos</label>
              <textarea name="objetivos" value={temario.objetivos || ''} onChange={handleInputChange} className="textarea-descripcion" placeholder="Lista los objetivos principales del curso, separados por líneas" />

              <h3>Temario Detallado</h3>
              {(temario.temario || []).map((cap, capIndex) => (
                <div key={capIndex} className="capitulo-editor">
                  <input value={cap.capitulo || ''} onChange={(e) => handleTemarioChange(capIndex, null, e.target.value)} className="input-capitulo" placeholder="Nombre del capítulo" />
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
            <div className="vista-resumida-editable">
              {/* ... (tu vista resumida igual que antes) ... */}
            </div>
          )}
        </div>
      </div>

      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar(prev => !prev)}>Ajustar y Regenerar</button>
        <button type="button" onClick={exportarPDF}>Exportar PDF</button>
        <button onClick={handleSaveClick} className="btn-guardar">Guardar Versión</button>
      </div>

      {mostrarFormRegenerar && (
        <div className="regenerar-form">
          {/* ... (igual que antes) ... */}
        </div>
      )}
    </div>
  );
}

export default EditorDeTemario;