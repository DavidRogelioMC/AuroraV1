import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useMemo, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';
import SolicitarRolCreadorAdmin from './SolicitarRolCreadorAdmin';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';
const DOMINIOS_PERMITIDOS = new Set([
  'netec.com','netec.com.mx','netec.com.co','netec.com.pe','netec.com.cl','netec.com.es','netec.com.pr'
]);

export default function Sidebar({ email = '', nombre, grupo, token }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(u => setAvatar(u.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  const dominio = useMemo(() => (email.split('@')[1] || '').toLowerCase(), [email]);
  const esNetec = DOMINIOS_PERMITIDOS.has(dominio);
  const puedeSolicitar = grupo === 'admin' && esNetec; // botón solo admins por dominio

  const toggle = () => setColapsado(v => !v);

  const rolTexto =
    grupo === 'admin' ? 'Administrador' :
    grupo === 'creador' ? 'Creador' :
    grupo === 'participant' ? 'Participante' :
    'Sin grupo';

  const puedeVerAjustes = esNetec; // Ajustes para admins por dominio

  return (
    <div id="barraLateral" className={`sidebar ${colapsado ? 'sidebar--colapsado' : ''}`}>
      <button className="collapse-btn" onClick={toggle}>
        {colapsado ? '▸' : '◂'}
      </button>

      <div className="perfilSidebar">
        <div className="avatar-wrap" onClick={() => setIsModalOpen(true)}>
          <img src={avatar || defaultFoto} alt="Avatar" className="avatar-img"/>
        </div>

        {!colapsado && <>
          <div className="nombre">{nombre || 'Usuario conectado'}</div>
          <div className="email">{email}</div>
          <div className="grupo">🎖️ Rol: {rolTexto}</div>

          {puedeSolicitar && (
            <div className="solicitar-creador-card">
              <SolicitarRolCreadorAdmin correoAutenticado={email} />
            </div>
          )}
        </>}
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div id="caminito" className="caminito">
        <Link to="/resumenes" className="nav-link">
          <div className="step"><div className="circle">🧠</div>{!colapsado && <span>Resúmenes</span>}</div>
        </Link>
        <Link to="/actividades" className="nav-link">
          <div className="step"><div className="circle">📘</div>{!colapsado && <span>Actividades</span>}</div>
        </Link>
        <Link to="/examenes" className="nav-link">
          <div className="step"><div className="circle">🔬</div>{!colapsado && <span>Examen</span>}</div>
        </Link>

        {puedeVerAjustes && (
          <Link to="/ajustes" className="nav-link">
            <div className="step"><div className="circle">⚙️</div>{!colapsado && <span>Ajustes</span>}</div>
          </Link>
        )}
      </div>
    </div>
  );
}

