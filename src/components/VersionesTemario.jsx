// src/components/VersionesTemario.jsx
import React, { useEffect, useState } from "react";
import "./VersionesTemario.css";
import { downloadTemarioAsExcel } from "../utils/downloadExcel";

/**
 * Panel de versiones que lista el historial y permite descargar cada versión en CSV/Excel.
 */
function VersionesTemario({ cursoId, apiBase, visible, onClose, onRestore }) {
  const [versiones, setVersiones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!visible || !cursoId) return;
    setLoading(true);
    setErr("");
    fetch(`${apiBase}/temarios?cursoId=${encodeURIComponent(cursoId)}`)
      .then((r) => (r.ok ? r.json() : r.json().then((e) => Promise.reject(e))))
      .then(setVersiones)
      .catch((e) => setErr(e?.error || "Error cargando versiones"))
      .finally(() => setLoading(false));
  }, [visible, cursoId, apiBase]);

  if (!visible) return null;

  return (
    <div className="versiones-overlay" role="dialog" aria-modal="true">
      <div className="versiones-card">
        <button className="btn-cerrar" onClick={onClose} aria-label="Cerrar">
          ✖
        </button>
        <h3>
          📑 Versiones de <code>{cursoId}</code>
        </h3>

        {loading && <p>Cargando…</p>}
        {err && <div className="error-mensaje">{err}</div>}

        {!loading && !err && (
          <ul className="lista-versiones">
            {versiones.map((v) => (
              <li key={v.versionId} className="item-version">
                <div className="col-info">
                  <strong>{new Date(v.createdAt).toLocaleString()}</strong>
                  <div className="nota">{v.nota || "Sin nota"}</div>
                  <div className="mini">
                    {v.isLatest ? "Última" : ""}{" "}
                    {v.size ? `• ${v.size} bytes` : ""}
                  </div>
                </div>

                <div className="col-actions">
                  <button
                    className="btn"
                    onClick={() =>
                      fetch(
                        `${apiBase}/temarios/${encodeURIComponent(
                          v.versionId
                        )}?cursoId=${encodeURIComponent(cursoId)}`
                      )
                        .then((r) => r.json())
                        .then(onRestore)
                    }
                  >
                    Restaurar
                  </button>

                  <button
                    className="btn sec"
                    onClick={() =>
                      fetch(
                        `${apiBase}/temarios/${encodeURIComponent(
                          v.versionId
                        )}?cursoId=${encodeURIComponent(cursoId)}`
                      )
                        .then((r) => r.json())
                        .then((json) =>
                          downloadTemarioAsExcel(json, cursoId, v.versionId)
                        )
                    }
                  >
                    Excel ⬇️
                  </button>
                </div>
              </li>
            ))}
            {versiones.length === 0 && <li>No hay versiones aún.</li>}
          </ul>
        )}
      </div>
    </div>
  );
}

export default VersionesTemario;

