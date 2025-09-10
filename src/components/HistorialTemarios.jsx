// src/components/HistorialTemarios.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./HistorialTemarios.css";

/**
 * Historial de versiones de temarios.
 *
 * Props:
 * - cursoId: string (obligatorio) => ej. "aws-serverless-basico"
 * - onPickVersion?: (jsonVersion) => void   // Para cargar la versión en tu editor
 *
 * Requisitos:
 * - VITE_API_URL debe apuntar a tu API Gateway (ej: https://xxxx.execute-api.us-east-1.amazonaws.com/dev2)
 * - Si usas Cognito/JWT, ajusta la obtención del token en getAuthHeader()
 */
export default function HistorialTemarios({ cursoId, onPickVersion }) {
  const [versiones, setVersiones] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [limite, setLimite] = useState(20); // cuántas mostrar
  const [busqueda, setBusqueda] = useState(""); // filtrar por nota/autor

  const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

  // === Helpers ===
  const getAuthHeader = () => {
    // Si no usas auth, puedes devolver {}
    // Si usas Cognito, agrega aquí tu token de id o access:
    const token = localStorage.getItem("id_token") || localStorage.getItem("access_token");
    return token ? { Authorization: token } : {};
  };

  const cargarListado = async () => {
    if (!cursoId || !apiUrl) return;
    setCargando(true);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/temarios?cursoId=${encodeURIComponent(cursoId)}`, {
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt}`);
      }
      const data = await res.json();
      setVersiones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError(e.message || "Error al cargar versiones");
    } finally {
      setCargando(false);
    }
  };

  const descargarJSON = async (versionId) => {
    if (!apiUrl) return;
    try {
      const res = await fetch(
        `${apiUrl}/temarios/${encodeURIComponent(versionId)}?cursoId=${encodeURIComponent(cursoId)}`,
        { headers: { ...getAuthHeader() } }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt}`);
      }
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fecha = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `${cursoId}__${fecha}__${versionId}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("No se pudo descargar el JSON:\n" + (e?.message || e));
    }
  };

  const cargarEnEditor = async (versionId) => {
    if (!onPickVersion || !apiUrl) return;
    try {
      const res = await fetch(
        `${apiUrl}/temarios/${encodeURIComponent(versionId)}?cursoId=${encodeURIComponent(cursoId)}`,
        { headers: { ...getAuthHeader() } }
      );
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Error ${res.status}: ${txt}`);
      }
      const json = await res.json();
      onPickVersion(json);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      alert("No se pudo cargar la versión en el editor:\n" + (e?.message || e));
    }
  };

  useEffect(() => {
    // Carga inicial cuando cambia cursoId
    setVersiones([]);
    if (cursoId && apiUrl) cargarListado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId, apiUrl]);

  const versionesFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    let arr = versiones;
    if (q) {
      arr = arr.filter((v) => {
        const nota = (v.nota || "").toLowerCase();
        const autor = (v.autorEmail || "").toLowerCase();
        const fecha = (v.createdAt || "").toLowerCase();
        return nota.includes(q) || autor.includes(q) || fecha.includes(q);
      });
    }
    return arr.slice(0, limite);
  }, [versiones, busqueda, limite]);

  return (
    <div className="historial-card">
      <div className="historial-header">
        <h3>📂 Historial de versiones <span className="curso-tag">— {cursoId || "sin curso"}</span></h3>
        <div className="historial-controls">
          <input
            type="text"
            placeholder="Buscar por nota, autor o fecha…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select value={limite} onChange={(e) => setLimite(parseInt(e.target.value) || 20)}>
            <option value={10}>Mostrar 10</option>
            <option value={20}>Mostrar 20</option>
            <option value={50}>Mostrar 50</option>
            <option value={100}>Mostrar 100</option>
          </select>
          <button onClick={cargarListado} disabled={cargando}>
            {cargando ? "Actualizando…" : "Actualizar"}
          </button>
        </div>
      </div>

      {error && <div className="historial-error">⚠️ {error}</div>}

      {!cargando && versionesFiltradas.length === 0 && !error && (
        <div className="historial-empty">No hay versiones registradas o no se pudieron cargar.</div>
      )}

      <ul className="historial-lista">
        {versionesFiltradas.map((v) => (
          <li key={v.versionId} className="historial-item">
            <div className="historial-main">
              <div className="historial-fecha">
                <strong>{v.createdAt ? new Date(v.createdAt).toLocaleString() : "Sin fecha"}</strong>
                {v.isLatest ? <span className="latest-chip">Última</span> : null}
              </div>
              <div className="historial-nota">{v.nota || <em>Sin nota</em>}</div>
              <div className="historial-meta">
                <span>{v.autorEmail || "Autor desconocido"}</span>
                {typeof v.size === "number" ? <span>• {v.size} bytes</span> : null}
                <span className="muted">• {v.versionId}</span>
              </div>
            </div>
            <div className="historial-actions">
              <button className="btn-light" onClick={() => descargarJSON(v.versionId)}>Descargar JSON</button>
              {onPickVersion ? (
                <button className="btn-primary" onClick={() => cargarEnEditor(v.versionId)}>
                  Cargar en el editor
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
