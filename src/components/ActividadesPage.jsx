// src/components/ActividadesPage.jsx

import { useState } from 'react';
import GeneradorActividades from './GeneradorActividades';
import './ActividadesPage.css'; // Crearemos este CSS a continuación

const tiposDeActividad = [
  { id: 'quiz', nombre: 'Opción Múltiple', icono: '❓' },
  { id: 'fill', nombre: 'Completar Espacios', icono: '✏️' },
  { id: 'truefalse', nombre: 'Verdadero o Falso', icono: '✅' },
  { id: 'match', nombre: 'Emparejamiento', icono: '🔗' },
];

function ActividadesPage({ token }) {
  const [tipoSeleccionado, setTipoSeleccionado] = useState(null);

  if (!tipoSeleccionado) {
    return (
      <div className="seleccion-actividad-container">
        <h1>Generador de Actividades</h1>
        <p>Elige el tipo de ejercicio interactivo que deseas crear a partir de tus documentos.</p>
        <div className="botones-actividad">
          {tiposDeActividad.map((tipo) => (
            <button key={tipo.id} className="btn-tipo-actividad" onClick={() => setTipoSeleccionado(tipo.id)}>
              <span className="icono-actividad">{tipo.icono}</span>
              <span>{tipo.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-generador">
      <button className="btn-volver" onClick={() => setTipoSeleccionado(null)}>
        ← Volver a seleccionar
      </button>
      <GeneradorActividades token={token} tipoActividad={tipoSeleccionado} />
    </div>
  );
}

export default ActividadesPage;
