// src/components/GeneradorContenidosPage.jsx (VERSIÓN MEJORADA + Botón de Versiones)
import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './GeneradorContenidosPage.css';

// 👇 Importa el botón flotante de versiones
import BotonVersionesTemario from './BotonVersionesTemario';

function GeneradorContenidosPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Verificamos si la ruta actual es exactamente '/generador-contenidos'
  // Si lo es, significa que estamos en la pantalla de selección.
  const mostrarMenu = location.pathname === '/generador-contenidos';

  // Si no estamos en la pantalla de selección, mostramos un botón para regresar.
  const handleRegresar = () => {
    navigate('/generador-contenidos'); // Navega de vuelta al menú principal
  };

  return (
    <div className="page-container-contenidos">
      {/* --- RENDERIZADO CONDICIONAL DEL MENÚ --- */}
      {mostrarMenu ? (
        <div className="menu-contenidos">
          <Link to="curso-estandar" className="opcion-menu">
            <div className="icono">📚</div>
            <div className="texto">
              <h3>Generador Temario Curso Estándar</h3>
              <p>Genera aquí tu propuesta de temario</p>
            </div>
          </Link>
          <div className="opcion-menu disabled">
            <div className="icono">🧪</div>
            <div className="texto">
              <h3>Laboratorios (Próximamente)</h3>
              <p>Realiza aquí tu guía de laboratorios.</p>
            </div>
          </div>
          <div className="opcion-menu disabled">
            <div className="icono">📊</div>
            <div className="texto">
              <h3>Presentación (Próximamente)</h3>
              <p>Realiza aquí la PPT del curso.</p>
            </div>
          </div>
          <div className="opcion-menu disabled">
            <div className="icono">💻</div>
            <div className="texto">
              <h3>Setup Guide (Próximamente)</h3>
              <p>Especificaciones de hardware y software necesarias para el ambiente de los participantes.</p>
            </div>
          </div>
        </div>
      ) : (
        // Si no se muestra el menú, mostramos el botón de regresar
        <button onClick={handleRegresar} className="btn-regresar-menu">
          &larr; Volver al menú de contenidos
        </button>
      )}

      <div className="contenido-generador">
        {/* El Outlet renderizará el GeneradorTemarios u otra cosa, 
            pero el menú de arriba ya no será visible */}
        <Outlet /> 
      </div>

      {/* 👇 Botón flotante para ver versiones (funciona en cualquier pantalla) */}
      <BotonVersionesTemario
        apiBase="https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2"
        // cursoId="aws-serverless-basico" // ← si lo dejas comentado, pedirá el cursoId por prompt
      />
    </div>
  );
}
export default GeneradorContenidosPage;
