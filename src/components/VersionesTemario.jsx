// src/components/VersionesTemario.jsx
import React, { useEffect, useState } from "react";
import "./VersionesTemario.css";
import { downloadTemarioAsExcel } from "../utils/downloadExcel";

function VersionesTemario({ cursoId, apiBase, visible, onClose, onRestore }) {
  const [versiones, setVersiones] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && cursoId) {
      setLoading(true);
      fetch(`${apiBase}/temarios?cursoId=${cursoId}`)
        .then((res) => res.json())
        .then((data) => setVersiones(data))
        .catch((err) => console.error("Error cargando versiones:", err))
        .finally(() => setLoading(false));
    }
  }, [visible, cursoId, apiBase]);

  if (!visible) return null;

  return (
    <div className="versiones-overlay">
      <div className="versiones-card">
        <h3>📑 Versiones de {cursoId}</h3>
        <button className="btn-cerrar" onClick={onClose}>✖</button>

        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="lista-versiones">
            {versiones.map((v) => (
              <li key={v.versionId}>
                <div>
                  <strong>{v.createdAt}</strong>
                  <p>{v.nota || "Sin nota"}</p>
                </div>
                <div className="acciones">
                  <button
                    onClick={() =>
                      fetch(`${apiBase}/temarios/${v.versionId}?cursoId=${cursoId}`)
                        .then((res) => res.json())
                        .then((json) => onRestore(json))
                    }
                  >
                    Restaurar
                  </button>
                  <button
                    onClick={() =>
                      fetch(`${apiBase}/temarios/${v.versionId}?cursoId=${cursoId}`)
                        .then((res) => res.json())
                        .then((json) => downloadTemarioAsExcel(json, cursoId, v.versionId))
                    }
                  >
                    Excel ⬇️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default VersionesTemario;
