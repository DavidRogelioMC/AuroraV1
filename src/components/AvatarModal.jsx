// src/components/AvatarModal.jsx
import { useState, useEffect } from "react";
import { Auth, Hub } from "aws-amplify";

// ⚠️ Debe apuntar a la URL base de tu API *incluyendo el stage* (ej. .../dev2) y sin '/' final
const API_BASE = String(import.meta.env.VITE_API_GATEWAY_URL || "").replace(/\/+$/, "");

export default function AvatarModal({ isOpen, onClose }) {
  // Estados
  const [avatars, setAvatars] = useState([]);                 // [{ key, url }]
  const [selectedAvatar, setSelectedAvatar] = useState(null); // { key, url }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --- Verificar sesión activa con retardo (tu lógica original)
  useEffect(() => {
    const timer = setTimeout(() => {
      Auth.currentSession()
        .then((session) => console.log("🟢 Sesión válida (revisada tarde):", session))
        .catch((err) => console.log("🔴 No hay sesión (revisada tarde):", err));
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // --- Verificación inmediata + listener de sesión (tu lógica original)
  useEffect(() => {
    const checkUser = async () => {
      try {
        const session = await Auth.currentSession();
        console.log("🟢 Sesión válida (checkUser):", session);
      } catch (error) {
        console.log("🔴 No hay sesión activa (checkUser):", error);
      }
    };
    checkUser();

    const listener = (data) => {
      if (data.payload.event === "signIn") console.log("✅ Usuario logueado (Hub)");
      if (data.payload.event === "signOut") console.log("👋 Usuario salió (Hub)");
    };
    Hub.listen("auth", listener);
    return () => Hub.remove("auth", listener);
  }, []);

  // --- Cargar avatares desde tu API cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        // Enviamos Authorization solo si hay id_token (por si tu API está protegida con Cognito)
        const token = localStorage.getItem("id_token");
        const r = await fetch(`${API_BASE}/avatars`, {
          method: "GET",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "omit",
        });
        if (!r.ok) throw new Error("No pude cargar avatares");
        const data = await r.json(); // [{ key, url }]
        if (!cancelled) setAvatars(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Error cargando avatares");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // --- Guardar elección en Cognito (atributo 'picture' con el S3 key)
  const handleSave = async () => {
    try {
      if (!selectedAvatar) {
        setError("⚠️ Selecciona un avatar primero.");
        return;
      }
      setSaving(true);
      setError("");

      // 1) Asegura que hay sesión
      try {
        await Auth.currentSession();
      } catch {
        setSaving(false);
        setError("La sesión expiró. Redirigiendo al inicio de sesión…");
        await Auth.federatedSignIn(); // Cognito Hosted UI
        return;
      }

      // 2) Usuario actual y update del atributo "picture"
      const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
      await Auth.updateUserAttributes(user, {
        // Guardamos el S3 KEY (no la URL firmada)
        picture: selectedAvatar.key,
      });

      alert("✅ Avatar actualizado correctamente");
      setSaving(false);
      onClose?.();

      // Si tu Sidebar no refresca el atributo automáticamente:
      // window.location.reload();
    } catch (err) {
      console.error("❌ Error al actualizar avatar:", err);
      setSaving(false);
      setError("⚠️ La sesión expiró o falló la actualización. Intenta reingresar.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" style={{ padding: 16 }}>
      <h2>Elige tu avatar</h2>

      {error && (
        <p style={{ color: "crimson", marginTop: 8, marginBottom: 8 }}>{error}</p>
      )}

      {loading ? (
        <div style={{ opacity: 0.8 }}>Cargando avatares…</div>
      ) : (
        <div
          className="avatar-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 80px)",
            gap: 12,
            marginTop: 12,
            marginBottom: 12,
          }}
        >
          {avatars.map(({ key, url }) => (
            <button
              key={key}
              onClick={() => setSelectedAvatar({ key, url })}
              title={key}
              style={{
                width: 80,
                height: 80,
                padding: 0,
                borderRadius: "50%",
                border:
                  selectedAvatar?.key === key
                    ? "3px solid #1e90ff"
                    : "2px solid #999",
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
        <button onClick={handleSave} disabled={!selectedAvatar || saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

