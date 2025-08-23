// src/components/AvatarModal.jsx
import { useState, useEffect } from "react";

// 🔧 Usa .env si existe; si no, cae a tu API real (incluye /dev2 y sin "/" final)
const API_BASE =
  (import.meta.env.VITE_API_GATEWAY_URL &&
    String(import.meta.env.VITE_API_GATEWAY_URL).replace(/\/+$/, "")) ||
  "https://h6ysn7u0tl.execute-api.us-east-1.amazonaws.com/dev2";

export default function AvatarModal({ isOpen, onClose }) {
  const [avatars, setAvatars] = useState([]);       // [{ key, url }]
  const [selected, setSelected] = useState(null);   // { key, url }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Cargar lista de avatares cuando se abre
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("id_token");
        const r = await fetch(`${API_BASE}/avatars`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const payload = await r.json();
        const list = Array.isArray(payload) ? payload : payload.avatars || [];
        if (!cancelled) setAvatars(list);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Error cargando avatares");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen]);

  // Guardar elección → POST /perfil/avatar (devuelve photoUrl firmada)
  const handleSave = async () => {
    if (!selected) {
      setError("⚠️ Selecciona un avatar primero.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("id_token");
      if (!token) throw new Error("Sin sesión");

      const res = await fetch(`${API_BASE}/perfil/avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatarKey: selected.key }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const photoUrl = data?.photoUrl || selected.url;

      // Notifica al Sidebar para actualizar la imagen al instante
      window.dispatchEvent(
        new CustomEvent("profilePhotoUpdated", { detail: { photoUrl } })
      );

      alert("✅ Avatar actualizado");
      onClose?.();
    } catch (e) {
      console.error(e);
      setError("No se pudo guardar el avatar. Vuelve a iniciar sesión e intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ padding: 16 }}>
      <h2>Elige tu avatar</h2>

      {error && <p style={{ color: "crimson", margin: "8px 0" }}>{error}</p>}

      {loading ? (
        <div style={{ opacity: 0.8 }}>Cargando avatares…</div>
      ) : (
        <div
          className="avatar-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 80px)",
            gap: 12,
            margin: "12px 0",
          }}
        >
          {avatars.map(({ key, url }) => (
            <button
              key={key}
              onClick={() => setSelected({ key, url })}
              title={key}
              style={{
                width: 80,
                height: 80,
                padding: 0,
                borderRadius: "50%",
                border: selected?.key === key ? "3px solid #1e90ff" : "2px solid #999",
                overflow: "hidden",
                cursor: "pointer",
                background: "transparent",
              }}
            >
              <img
                src={url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSave} disabled={!selected || saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}
