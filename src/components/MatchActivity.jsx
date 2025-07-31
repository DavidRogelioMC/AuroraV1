// src/components/MatchActivity.jsx (CÓDIGO COMPLETO Y CORREGIDO)

import { useState, useEffect, useMemo } from 'react';
import './MatchActivity.css';

// Función para barajar un array
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

function MatchActivity({ data }) { // data es {conceptos, definiciones, justificaciones}
  const [conceptos, setConceptos] = useState(data.conceptos);
  const [definiciones, setDefiniciones] = useState([]);
  const [conexiones, setConexiones] = useState({});

  // Estados nuevos para la interactividad
  const [haRevisado, setHaRevisado] = useState(false);
  const [puntuacion, setPuntuacion] = useState(0);
  const [mostrarJustificaciones, setMostrarJustificaciones] = useState(false);

  // Barajamos las definiciones solo una vez
  useEffect(() => {
    setDefiniciones(shuffleArray(data.definiciones));
  }, [data.definiciones]);

  // Creamos un mapa de respuestas correctas para una verificación más fácil
  const mapaRespuestasCorrectas = useMemo(() => {
    const map = {};
    data.conceptos.forEach(c => {
      const idNumerico = c.id.split('_')[1];
      map[c.id] = `definicion_${idNumerico}`;
    });
    return map;
  }, [data.conceptos]);

  const handleDrop = (e, conceptoId) => {
    e.preventDefault();
    if (haRevisado) return;
    const definicionId = e.dataTransfer.getData("definicionId");
    setConexiones(prev => ({ ...prev, [conceptoId]: definicionId }));
  };

  const handleDragStart = (e, definicionId) => {
    e.dataTransfer.setData("definicionId", definicionId);
  };

  const revisarRespuestas = () => {
    let correctas = 0;
    conceptos.forEach(concepto => {
      if (conexiones[concepto.id] && conexiones[concepto.id] === mapaRespuestasCorrectas[concepto.id]) {
        correctas++;
      }
    });
    setPuntuacion(correctas);
    setHaRevisado(true);
  };

  const reiniciarActividad = () => {
    setConexiones({});
    setHaRevisado(false);
    setPuntuacion(0);
    setMostrarJustificaciones(false);
    setDefiniciones(shuffleArray(data.definiciones));
  };
  
  const getMatchStatusClass = (conceptoId) => {
    if (!haRevisado) return '';
    const esCorrecto = conexiones[conceptoId] && conexiones[conceptoId] === mapaRespuestasCorrectas[conceptoId];
    return esCorrecto ? 'match-correcto' : 'match-incorrecto';
  };

  return (
    <div className="interactive-activity">
      <div className="match-columns">
        <div className="column conceptos-column">
          <h3>Conceptos</h3>
          {conceptos.map(concepto => (
            <div 
              key={concepto.id} 
              className={`droppable-area ${getMatchStatusClass(concepto.id)}`} 
              onDrop={(e) => handleDrop(e, concepto.id)} 
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="concepto-texto">{concepto.texto}</div>
              {conexiones[concepto.id] && (
                <div className="definicion-conectada">
                  {definiciones.find(d => d.id === conexiones[concepto.id])?.texto}
                </div>
              )}
              {mostrarJustificaciones && haRevisado && (
                <div className="justificacion-container-match">
                  <p>{data.justificaciones[concepto.id]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="column definiciones-column">
          <h3>Definiciones</h3>
          {definiciones.map(definicion => (
            <div 
              key={definicion.id} 
              className="draggable-item" 
              draggable={!haRevisado} // No se puede arrastrar después de revisar
              onDragStart={(e) => handleDragStart(e, definicion.id)}
            >
              {definicion.texto}
            </div>
          ))}
        </div>
      </div>

      {/* --- SECCIÓN DEL FOOTER MODIFICADA --- */}
      <div className="activity-footer">
        {!haRevisado ? (
          <div className="resultado-y-reinicio" style={{ justifyContent: 'flex-end' }}>
            <button onClick={revisarRespuestas} className="btn-revisar">Revisar Respuestas</button>
          </div>
        ) : (
          <div className="resultado-y-reinicio footer-botones-resultado">
            <div className="resultado-final">
              Puntuación: {puntuacion} de {conceptos.length}
            </div>
            
            <button onClick={() => setMostrarJustificaciones(prev => !prev)} className="btn-justificacion">
              {mostrarJustificaciones ? 'Ocultar Justificaciones' : 'Ver Justificaciones'}
            </button>
            
            <button onClick={reiniciarActividad} className="btn-reiniciar">
              Reiniciar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchActivity;
