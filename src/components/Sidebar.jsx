// src/components/Sidebar.jsx
import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultFoto from '../assets/default.jpg';
import { useEffect, useMemo, useState } from 'react';
import { Auth } from 'aws-amplify';
import AvatarModal from './AvatarModal';

const API_BASE = 'https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2';
const DOMINIOS_PERMITIDOS = new Set([
  'netec.com','netec.com.mx','netec.com.co','netec.com.pe','netec.com.cl','netec.com.es','netec.com.pr'
]);
const ADMIN_EMAIL = 'anette.flores@netec.com.mx';

export default function Sidebar({ email = '', nombre, grupo = '', token }) {
  const [avatar, setAvatar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colapsado, setColapsado] = useState(false);

  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState(''); // '', pendiente, aprobado, rechazado
  const [error, setError] = useState('');

  useEffect(() => {
    Auth.currentAuthenticatedUser({ bypassCache: true })
      .then(u => setAvatar(u?.attributes?.picture || null))
      .catch(() => setAvatar(null));
  }, []);

  const dominio = useMemo(() => (email.split('@')[1] || '').toLowerCase(), [email]);
  const esNetec = DOMINIOS_PERMITIDOS.has(dominio);

  // 👇 override local para que Anette "simule" rol en la UI
  const override = (typeof window !== 'undefined' && localStorage.getItem('ui_active_role')) || '';
  const grupoMostrado = (['admin','creador','participant'].includes(override) ? override : '') || grupo;

  // Mostrar botón si es dominio netec y NO es creador
  const mostrarBoton = esNetec && (grupoMostrado !== 'creador');

  const authHeader = useMemo(() => {
    if (!token) return {};
    const v = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    return { Authorization: v };
  }, [token]);

  // Traer estado persistente de la solicitud
  useEffect(() => {
    if (!email || !esNetec) return;
    const fetchEstado = async () => {
      setError('');
      try {
        const r = await fetch(`${API_BASE}/obtener-solicitudes-rol`, { headers: authHeader });
        if (!r.ok) return;
        const data = await r.json().catch(() => ({}));
        const lista = Array.isArray(data?.solicitudes) ? data.solicitudes : [];
        const it = lista.find(s => (s.correo || '').toLowerCase() === email.toLowerCase());
        const e = (it?.estado || '').toLowerCase();
        if (['aprobado','pendiente','rechazado'].includes(e)) setEstado(e);
        else setEstado('');
      } catch {}
    };
    fetchEstado();
  }, [email, esNetec, authHeader]);

  const toggle = () => setColapsado(v => !v);

  const enviarSolicitud = async () => {
    if (!email) return;
    setEnviando(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/solicitar-rol`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ correo: email })
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || 'Rechazado por servidor');
      setEstado('pendiente');
    } catch (e) {
      setError('Error de red al enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  const rolTexto =
    grupoMostrado === 'admin' ? 'Administrador' :
    grupoMostrado === 'creador' ? 'Creador' :
    grupoMostrado === 'participant' ? 'Participante' :
    'Sin grupo';

  const puedeVerAdmin = email === ADMIN_EMAIL;

  const disabled = estado === 'pendiente' || estado === 'aprobado' || enviando;
  const label =
    estado === 'aprobado'  ? '✅ Ya eres Creador'
  : estado === 'pendiente' ? '⏳ Solicitud enviada'
  : '📩 Solicitar rol de Creador';

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

          {mostrarBoton && (
            <div className="solicitar-creador-card">
              <button
                className="solicitar-creador-btn"
                onClick={enviarSolicitud}
                disabled={disabled}
                title={email}
              >
                {label}
              </button>
              {!!error && <div className="solicitar-creador-error">❌ {error}</div>}
              {estado === 'rechazado' && (
                <div className="solicitar-creador-error" style={{color:'#ffd18a'}}>
                  ❗ Tu última solicitud fue rechazada. Puedes volver a intentarlo.
                </div>
              )}
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

        {/* Ajustes: todos pueden entrar */}
        <Link to="/ajustes" className="nav-link">
          <div className="step"><div className="circle">🛠️</div>{!colapsado && <span>Ajustes</span>}</div>
        </Link>

        {/* Admin: solo Anette */}
        {puedeVerAdmin && (
          <Link to="/admin" className="nav-link">
            <div className="step"><div className="circle">⚙️</div>{!colapsado && <span>Admin</span>}</div>
          </Link>
        )}
      </div>
    </div>
  );
}

