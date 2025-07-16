// src/components/MatchActivity.jsx

import { useState, useEffect } from 'react';
import './MatchActivity.css'; 

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

function MatchActivity({ data }) {
  const [conceptos, setConceptos] = useState([]); // Inicializa como array vacío
  const [definiciones, setDefiniciones] = useState([]);
  const [conexiones, setConexiones] = useState({});
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    // Cuando los datos cambian, reiniciamos todo el componente
    setConceptos(data.conceptos);
    setDefiniciones(shuffleArray(data.definiciones));
    setConexiones({});
    setResultado(null);
  }, [data]);

  const handleDrop = (e, conceptoId) => {
    e.preventDefault();
    const definicionId = e.dataTransfer.getData("definicionId");
    setConexiones(prev => ({ ...prev, [conceptoId]: definicionId }));
  };

  const handleDragStart = (e, definicionId) => {
    e.dataTransfer.setData("definicionId", definicionId);
  };

  const revisarRespuestas = () => {
    let correctas = 0;
    conceptos.forEach(concepto => {
      const conceptoNum = concepto.id.split('_')[1];
      const definicionConectadaId = conexiones[concepto.id];
      if (definicionConectadaId) {
        const definicionNum = definicionConectadaId.split('_')[1];
        if (conceptoNum === definicionNum) {
          correctas++;
        }
      }
    });
    setResultado(`Obtuviste ${correctas} de ${conceptos.length} correctas.`);
  };

  // --- 1. AÑADIMOS LA FUNCIÓN PARA REINICIAR LA ACTIVIDAD ---
  const reiniciarActividad = () => {
    setConexiones({}); // Limpia las conexiones hechas por el usuario
    setResultado(null); // Oculta el mensaje de resultado
    // Volvemos a mezclar las definiciones para que sea un nuevo reto
    setDefiniciones(shuffleArray(data.definiciones)); 
  };

  return (
    <div className="interactive-activity">
      <div className="match-columns">
        <div className="column conceptos-column">
          <h3>Conceptos</h3>
          {conceptos.map(concepto => (
            <div key={concepto.id} className="droppable-area" onDrop={(e) => handleDrop(e, concepto.id)} onDragOver={(e) => e.preventDefault()}>
              <div className="concepto-texto">{concepto.texto}</div>
              {conexiones[concepto.id] && (
                <div className="definicion-conectada">
                  {definiciones.find(d => d.id === conexiones[concepto.id])?.texto}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="column definiciones-column">
          <h3>Definiciones (Arrastra y suelta)</h3>
          {/* Ocultamos las definiciones que ya han sido usadas */
          definiciones
            .filter(definicion => !Object.values(conexiones).includes(definicion.id))
            .map(definicion => (
              <div key={definicion.id} className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, definicion.id)}>
                {definicion.texto}
              </div>
          ))}
        </div>
      </div>

      {/* --- 2. MODIFICAMOS EL FOOTER DE LA ACTIVIDAD --- */}
      <div className="activity-footer">
        {!resultado ? (
          // Si no hay resultado, muestra el botón de "Revisar"
          <button onClick={revisarRespuestas} className="btn-revisar">Revisar</button>
        ) : (
          // Si ya hay un resultado, muestra la puntuación y el botón de "Reiniciar"
          <div className="resultado-y-reinicio">
            <div className="resultado-final">{resultado}</div>
            <button onClick={reiniciarActividad} className="btn-reiniciar">
              🔄 Reiniciar Actividad
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MatchActivity;
