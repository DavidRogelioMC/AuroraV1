// src/components/GeneradorContenidosPage.jsx (VERSIÓN MEJORADA)

import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import './GeneradorContenidosPage.css';

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
            <div className="icono">📘</div>
            <div className="texto">
              <h3>Curso Estándar</h3>
              <p>Genera un temario completo para un curso.</p>
            </div>
          </Link>
          <div className="opcion-menu disabled">
            <div className="icono">📄</div>
            <div className="texto">
              <h3>Artículo (Próximamente)</h3>
              <p>Genera un artículo técnico o un blog post.</p>
            </div>
          </div>
          <div className="opcion-menu disabled">
            <div className="icono">💡</div>
            <div className="texto">
              <h3>Idea Rápida (Próximamente)</h3>
              <p>Genera ideas para contenido nuevo.</p>
            </div>
          </div>
          <div className="opcion-menu disabled">
            <div className="icono">📊</div>
            <div className="texto">
              <h3>Presentación (Próximamente)</h3>
              <p>Genera el esqueleto de una presentación.</p>
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
    </div>
  );
}
export default GeneradorContenidosPage;
