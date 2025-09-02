// src/components/GeneradorContenidosPage.jsx

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './GeneradorContenidosPage.css'; // Crearemos este CSS

function GeneradorContenidosPage() {
  return (
    <div className="page-container-contenidos">
      <div className="menu-contenidos">
        <Link to="curso-estandar" className="opcion-menu">
          <div className="icono">📘</div>
          <div className="texto">
            <h3>Curso Estándar</h3>
            <p>Genera un temario completo para un curso.</p>
          </div>
        </Link>
        {/* Aquí irían las otras 3 opciones de menú */}
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

      <div className="contenido-generador">
        {/* Outlet le dice a React Router dónde renderizar la ruta anidada */}
        <Outlet /> 
      </div>
    </div>
  );
}

export default GeneradorContenidosPage;
