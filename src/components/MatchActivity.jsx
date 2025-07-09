// src/components/MatchActivity.jsx
import { useState, useEffect } from 'react';
import './InteractiveActivity.css'; // Usaremos un CSS compartido

const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

function MatchActivity({ data }) {
  const [conceptos, setConceptos] = useState(data.conceptos);
  const [definiciones, setDefiniciones] = useState([]);
  const [conexiones, setConexiones] = useState({});
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    setDefiniciones(shuffleArray(data.definiciones));
  }, [data.definiciones]);

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
      if (conexiones[concepto.id] && concepto.id.split('_')[1] === conexiones[concepto.id].split('_')[1]) {
        correctas++;
      }
    });
    setResultado(`Obtuviste ${correctas} de ${conceptos.length} correctas.`);
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
          {definiciones.map(definicion => (
            <div key={definicion.id} className="draggable-item" draggable onDragStart={(e) => handleDragStart(e, definicion.id)}>
              {definicion.texto}
            </div>
          ))}
        </div>
      </div>
      <button onClick={revisarRespuestas} className="btn-revisar">Revisar</button>
      {resultado && <div className="resultado-final">{resultado}</div>}
    </div>
  );
}
export default MatchActivity;
