import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';
import defaultFoto from '../assets/default.jpg';
import './Sidebar.css';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';
const DOMINIOS_PERMITIDOS = new Set([
  'netec.com',
  'netec.com.mx',
  'netec.com.co',
  'netec.com.pe',
  'netec.com.cl',
  'netec.com.es'
]);

export default function Sidebar({ email, grupo, nombre, token }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  // Estado de la solicitud de creador
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  // Cargar foto de perfil de Cognito
  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(u => setAvatar(u.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  // Calcular dominio y si puede solicitar rol de creador
  const dominio = useMemo(
    () => (email?.split('@')[1] || '').toLowerCase(),
    [email]
  );
  const esDominioNetec = DOMINIOS_PERMITIDOS.has(dominio);
  const puedeSolicitarCreador = grupo === 'admin' && esDominioNetec;

  const toggleColapsar = () => setColapsado(v => !v);

  // Enviar solicitud de rol de creador
  const enviarSolicitudCreador = async () => {
    setEnviando(true);
    setOk(false);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify({ correo: email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Servidor rechazó la solicitud');
      }
      setOk(true);
    } catch (e) {
      console.error('❌ Error al enviar solicitud:', e);
      setError('Error de red al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const rolFormateado = 
    grupo === 'admin' ? 'Administrador' :
    grupo === 'participant' ? 'Participante' :
    'Sin rol';

  return (
    <div id="barraLateral" className={`sidebar ${colapsado ? 'sidebar--colapsado' : ''}`}>
      {/* Botón de colapsar/expandir */}
      <button
        className="collapse-btn"
        onClick={toggleColapsar}
        aria-label={colapsado ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {colapsado ? '▸' : '◂'}
      </button>

      {/* Perfil */}
      <div className="perfilSidebar">
        <div className="avatar-wrap" onClick={() => setIsModalOpen(true)}>
          <img
            src={avatar || defaultFoto}
            alt="Foto perfil"
            className="avatar-img"
          />
        </div>

        {!colapsado && (
          <>
            <div className="nombre">{nombre || 'Usuario conectado'}</div>
            <div className="email">{email}</div>
            <div className="grupo">🎖️ Rol: {rolFormateado}</div>

            {puedeSolicitarCreador && (
              <div className="solicitar-creador-card">
                <button
                  className="solicitar-creador-btn"
                  onClick={enviarSolicitudCreador}
                  disabled={enviando || ok}
                >
                  {enviando
                    ? 'Enviando…'
                    : ok
                    ? '✅ Solicitud enviada'
                    : '📩 Solicitar rol de Creador'}
                </button>
                {error && <div className="solicitar-creador-error">❌ {error}</div>}
              </div>
            )}
          </>
        )}
      </div>

      <AvatarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Navegación */}
      <div id="caminito" className="caminito">
        <Link to="/resumenes" className="nav-link">
          <div className="step">
            <div className="circle">🧠</div>
            {!colapsado && <span>Resúmenes</span>}
          </div>
        </Link>
        <Link to="/actividades" className="nav-link">
          <div className="step">
            <div className="circle">📘</div>
            {!colapsado && <span>Actividades</span>}
          </div>
        </Link>
        <Link to="/examenes" className="nav-link">
          <div className="step">
            <div className="circle">🔬</div>
            {!colapsado && <span>Examen</span>}
          </div>
        </Link>

        {grupo === 'admin' && (
          <>
            <Link to="/admin" className="nav-link">
              <div className="step">
                <div className="circle">⚙️</div>
                {!colapsado && <span>Admin</span>}
              </div>
            </Link>
            <Link to="/usuarios" className="nav-link">
              <div className="step">
                <div className="circle">👥</div>
                {!colapsado && <span>Usuarios</span>}
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
