// src/components/EditorDeTemario.jsx
import React, { useState, useEffect, useRef } from 'react';
import netecLogo from '../assets/Netec.png';
import './EditorDeTemario.css';

function EditorDeTemario({ temarioInicial, onRegenerate, onSave, isLoading }) {
  const [temario, setTemario] = useState(temarioInicial);
  const [vista, setVista] = useState('detallada');
  const [mostrarFormRegenerar, setMostrarFormRegenerar] = useState(false);

  // Área raíz que contiene la vista limpia y la de app
  const pdfRef = useRef(null);

  // Utilidad: carga un asset/URL como dataURL
  const toDataURL = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.readAsDataURL(blob);
    });
  };

  // Utilidad: genera un PNG translúcido (fallback si jsPDF no soporta GState)
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
    ctx.globalAlpha = alpha; // 👈 opacidad de la marca de agua
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  };

  // Exportar PDF: usa SOLO la plantilla .pdf-clean y luego estampa watermark por página
  const exportarPDF = async () => {
    const clean = pdfRef.current?.querySelector('.pdf-clean');
    if (!clean) return;

    clean.classList.add('pdf-exporting'); // muestra .pdf-clean fuera del viewport
    try {
      const { default: html2pdf } = await import('html2pdf.js');

      const titulo = temario?.nombre_curso || temario?.tema_curso || 'temario';
      const filename = `temario_${String(titulo).replace(/\s+/g, '_')}.pdf`;

      const opt = {
        margin: [12, 12, 16, 12],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // 1) Genera el PDF desde la vista limpia
      const worker = html2pdf().set(opt).from(clean).toPdf();
      const pdf = await worker.get('pdf');

      // 2) Marca de agua: logo translúcido en TODAS las páginas
      const rawLogo = await toDataURL(netecLogo);
      const total = pdf.internal.getNumberOfPages();
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();

      // Si el engine soporta GState, usamos opacidad nativa; si no, usamos PNG translúcido
      const canGState = Boolean(pdf.setGState && pdf.GState);
      const wmLogo = canGState ? rawLogo : await makeTranslucent(rawLogo, 0.06);

      const props = pdf.getImageProperties(wmLogo);
      const imgW = W * 0.55; // 55% del ancho de página
      const imgH = imgW * (props.height / props.width);
      const x = (W - imgW) / 2;
      const y = (H - imgH) / 2;

      for (let i = 1; i <= total; i++) {
        pdf.setPage(i);
        if (canGState) {
          pdf.setGState(new pdf.GState({ opacity: 0.06 })); 
          pdf.addImage(rawLogo, 'PNG', x, y, imgW, imgH);
          pdf.setGState(new pdf.GState({ opacity: 1 }));
        } else {
          pdf.addImage(wmLogo, 'PNG', x, y, imgW, imgH);
        }
      }

      // =================================================================
// =========      AÑADIR ESTE BLOQUE PARA LA NUMERACIÓN      =========
// =================================================================
const pageNumText = "Página";
// Configurar fuente y color para el número de página
pdf.setFontSize(10);
pdf.setTextColor(100); // Color gris (0 es negro, 255 es blanco)

for (let i = 1; i <= total; i++) {
  pdf.setPage(i);

  // Construir el texto "Página i de N"
  const text = `${pageNumText} ${i} de ${total}`;

  // Calcular la posición (abajo y al centro de la página)
  const textWidth = pdf.getStringUnitWidth(text) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
  const x = (W - textWidth) / 2; // Centrado horizontalmente
  const y = H - 10; // 10mm desde el borde inferior

  // Escribir el texto directamente en el PDF
  pdf.text(text, x, y);
}
// =================================================================
// =================== FIN DEL BLOQUE A AÑADIR ===================
// =================================================================
      // 3) Guarda el PDF
      await worker.save();
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

  // Handlers de edición
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemario((prev) => ({ ...prev, [name]: value }));
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

  const handleParamsChange = (e) => {
    const { name, value } = e.target;
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegenerateClick = () => {
    onRegenerate(params);
    setMostrarFormRegenerar(false);
  };

  const handleSaveClick = () => onSave(temario);

  if (!temario) return null;

  return (
    <div className="editor-container">
      <div ref={pdfRef} id="temario-pdf">
        {/* ========= VISTA LIMPIA SOLO PARA PDF ========= */}
        <div className="pdf-clean">
          {/* ========= NUEVO ENCABEZADO CORPORATIVO (SOLO LOGO) ========= */}
<div className="pdf-header-corp">
  <div className="header-left">
    <img src={netecLogo} alt="Netec Logo" className="header-logo-netec" />
  </div>
</div>
{/* Línea divisora debajo del header */}
<div className="pdf-header-divider" />

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

            {/* Salto de página para empezar Temario en una nueva hoja */}
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

          {/* ========= NUEVO FOOTER CORPORATIVO ========= */}
<div className="pdf-footer-corp">
  <div className="pdf-footer-divider" />
  <div className="footer-content">
    <span className="footer-left">Presencial Internacional</span>
    <span className="footer-right">www.netec.com</span>
  </div>
</div>
        {/* ========= FIN VISTA LIMPIA ========= */}

        {/* ========= VISTA APP (NO SE EXPORTA) ========= */}
        <div className="app-view">
          <div className="vista-selector">
            <button
              className={`btn-vista ${vista === 'detallada' ? 'activo' : ''}`}
              onClick={() => setVista('detallada')}
            >
              Vista Detallada
            </button>
            <button
              className={`btn-vista ${vista === 'resumida' ? 'activo' : ''}`}
              onClick={() => setVista('resumida')}
            >
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
              {/* … tu vista resumida igual que antes … */}
            </div>
          )}
        </div>
      </div>

      <div className="acciones-footer">
        <button onClick={() => setMostrarFormRegenerar((prev) => !prev)}>Ajustar y Regenerar</button>
        <button type="button" onClick={exportarPDF}>Exportar PDF</button>
        <button onClick={handleSaveClick} className="btn-guardar">Guardar Versión</button>
      </div>

      {mostrarFormRegenerar && (
        <div className="regenerar-form">
          {/* … igual que antes … */}
        </div>
      )}
    </div>
  );
}

export default EditorDeTemario;
