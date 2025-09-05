// src/components/AvatarPicker.jsx
import { useEffect, useMemo, useState } from "react";
import { Auth } from "aws-amplify";

// ✅ Incluye variantes en mayúsculas/minúsculas
const avatarModules = import.meta.glob("../assets/avatars/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP,svg,SVG}", {
  eager: true,
});

// ✅ Orden estable por nombre de archivo (numérico si aplica)
function filename(url) {
  try {
    const name = url.split("/").pop() || "";
    return name;
  } catch {
    return url;
  }
}
function numericKey(name) {
  // "15.PNG" -> 15 ; "avatar-cat.png" -> NaN
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : NaN;
}

const AVATAR_URLS = Object.entries(avatarModules)
  .map(([, m]) => m.default)
  .sort((a, b) => {
    const A = filename(a), B = filename(b);
    const na = numericKey(A), nb = numericKey(B);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb; // ambos numéricos
    if (!Number.isNaN(na)) return -1;
    if (!Number.isNaN(nb)) return 1;
    return A.localeCompare(B); // alfabético como fallback
  });

// Clave de storage por usuario (email opcional)
const storageKey = (email) => `app_avatar_url:${email || "anon"}`;

export default function AvatarPicker({ isOpen, onClose, email, onSaved }) {
  const [selected, setSelected] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const prev = localStorage.getItem(storageKey(email)) || "";
    setSelected(prev);
  }, [isOpen, email]);

  const save = async () => {
    if (!selected) return;

    // 1) Persistencia local (no depende de Lambda)
    localStorage.setItem(storageKey(email), selected);

    // 2) Opcional: sincronizar con Cognito (sin Lambda)
    try {
      const flag = String(import.meta.env.VITE_AVATAR_SYNC_COGNITO || "true");
      if (flag === "true") {
        const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
        await Auth.updateUserAttributes(user, { picture: selected });
      }
    } catch (err) {
      console.log("No se pudo sincronizar avatar con Cognito (ok):", err?.message || err);
    }

    onSaved?.(selected);
    onClose?.();
  };

  const clear = async () => {
    localStorage.removeItem(storageKey(email));
    try {
      const flag = String(import.meta.env.VITE_AVATAR_SYNC_COGNITO || "true");
      if (flag === "true") {
        const user = await Auth.currentAuthenticatedUser({ bypassCache: true });
        await Auth.updateUserAttributes(user, { picture: "" });
      }
    } catch {}
    onSaved?.("");
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "min(680px, 92vw)",
          background: "#0f172a",
          color: "#e5e7eb",
          borderRadius: 14,
          padding: 18,
          boxShadow: "0 20px 60px rgba(0,0,0,.5)",
        }}
      >
        <h3 style={{ margin: 0, marginBottom: 12 }}>Elige tu avatar</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))",
            gap: 12,
            maxHeight: 360,
            overflow: "auto",
            paddingRight: 4,
          }}
        >
          {AVATAR_URLS.map((url) => {
            const isSel = selected === url;
            return (
              <button
                key={url}
                onClick={() => setSelected(url)}
                title={filename(url)}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: isSel ? "3px solid #22d3ee" : "2px solid #475569",
                  padding: 0,
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
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
          <button onClick={clear} style={btn("ghost")}>Quitar</button>
          <button onClick={onClose} style={btn("ghost")}>Cerrar</button>
          {/* ✅ Usa tu color primario */}
          <button onClick={save} disabled={!selected} style={btn("primary")}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function btn(variant) {
  const base = {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid transparent",
    cursor: "pointer",
    fontWeight: 600,
  };
  if (variant === "primary")
    return { ...base, background: "#035b6e", color: "#ffffff" }; // ← primario Netec
  return { ...base, background: "transparent", color: "#e5e7eb", borderColor: "#334155" };
}
