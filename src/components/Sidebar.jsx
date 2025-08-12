import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useMemo, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';
const DOMINIOS_PERMITIDOS = new Set([
  'netec.com', 'netec.com.mx', 'netec.com.co',
  'netec.com.pe', 'netec.com.cl', 'netec.com.es', 'netec.com.pr'
]);
const ADMIN_EMAIL = 'anette.flores@netec.com.mx';

export default function Sidebar({ email = '', nombre, grupo, token }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  // Estado del botón de solicitud
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [estadoSolicitud, setEstadoSolicitud] = useState(''); // '', 'pendiente', 'aprobado', 'rechazado'

  useEffect(() => {
    Auth.currentAuthenticatedUser()
      .then(u => setAvatar(u.attributes.picture))
      .catch(() => setAvatar(null));
  }, []);

  const dominio = useMemo(() => (email.split('@')[1] || '').toLowerCase(), [email]);
  const esNetec = DOMINIOS_PERMITIDOS.has(dominio);
  const esAnette = (email || '').toLowerCase() === ADMIN_EMAIL;

  // Puede solicitar: admins por dominio Netec (no participantes) y que NO sea Anette
  const puedeSolicitar = !esAnette && esNetec && grupo === 'admin';

  const toggle = () => setColapsado(v => !v);

  // Traer estado persistido de la solicitud desde DynamoDB
  const cargarEstadoSolicitud = async () => {
    if (!token || !email) return;
    try {
      const r = await fetch(`${API_BASE}/obtener-solicitudes-rol`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await r.json().catch(() => ({}));
      const lista = Array.isArray(data?.solicitudes) ? data.solicitudes : [];
      const m = lista.find(s => (s.correo || '').toLowerCase() === email.toLowerCase());
      const e = (m?.estado || '').toLowerCase();
      setEstadoSolicitud(e || '');
    } catch (e) {
      // Silencioso: si falla, no rompemos la UI
    }
  };

  useEffect(() => {
    cargarEstadoSolicitud();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, token]);

  const enviarSolicitud = async () => {
    setEnviando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ correo: email })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Rechazado por servidor');
      // Persistimos inmediatamente a "pendiente" para que el botón no se re-habilite
      setEstadoSolicitud('pendiente');
    } catch (e) {
      console.error(e);
      setError('Error de red al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  // Texto de rol mostrado
  const rolTexto =
    grupo === 'creador' ? 'Creador' :
    grupo === 'admin' ? 'Administrador' :
    grupo === 'participant' ? 'Participante' : 'Sin grupo';

  // Si ya es creador por token o si la solicitud está aprobada, mostramos estado fijo
  const yaEsCreador = grupo === 'creador' || estadoSolicitud === 'aprobado';

  // ¿mostrar Ajustes? solo para correos de dominios Netec
  const puedeVerAjustes = esNetec;

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

          {/* Anette siempre verá que ya es creador */}
          {esAnette && (
            <div className="solicitar-creador-card">
              <button className="solicitar-creador-btn" disabled>
                ✅ Ya eres Creador
              </button>
            </div>
          )}

          {/* Botón solicitar: solo para admins Netec distintos a Anette */}
          {!esAnette && puedeSolicitar && (
            <div className="solicitar-creador-card">
              <button
                className="solicitar-creador-btn"
                onClick={enviarSolicitud}
                disabled={enviando || yaEsCreador || estadoSolicitud === 'pendiente'}
              >
                {yaEsCreador
                  ? '✅ Ya eres Creador'
                  : estadoSolicitud === 'pendiente'
                  ? '⏳ Solicitud enviada (Pendiente)'
                  : enviando
                  ? 'Enviando…'
                  : '📩 Solicitar rol de Creador'}
              </button>
              {!!error && <div className="solicitar-creador-error">❌ {error}</div>}
            </div>
          )}
        </>}
      </div>

      <AvatarModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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

        {puedeVerAjustes && (
          <Link to="/ajustes" className="nav-link">
            <div className="step">
              <div className="circle">⚙️</div>
              {!colapsado && <span>Ajustes</span>}
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

