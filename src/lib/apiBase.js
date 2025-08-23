// src/lib/apiBase.js
// Resuelve el API BASE (https://<apiId>.execute-api.<region>.amazonaws.com/<stage>)
// usando TUS variables ya existentes.

function stripEnd(s = '') {
  return String(s).replace(/\/+$/, '');
}

function tryStageBase(fromUrl) {
  try {
    const u = new URL(fromUrl);
    // /dev2/generarActividad -> ['', 'dev2', 'generarActividad']
    const parts = u.pathname.replace(/\/+$/, '').split('/');
    if (parts.length >= 2 && parts[1]) {
      return `${u.origin}/${parts[1]}`;
    }
  } catch {}
  return null;
}

/**
 * Prioridad:
 * 1) VITE_API_BASE_AVATARES (si la defines, usa esta y listo)
 * 2) Derivar base desde otras URLs tuyas que ya tienen /dev2/<ruta>
 * 3) VITE_API_GATEWAY_URL si trae /<stage>
 */
export function getApiBase() {
  const explicit = import.meta.env.VITE_API_BASE_AVATARES || import.meta.env.VITE_API_GATEWAY_URL_AVATARS;
  if (explicit) return stripEnd(explicit);

  const candidates = [
    import.meta.env.VITE_API_GENERAR_ACTIVIDADES,
    import.meta.env.VITE_API_GENERAR_EXAMEN,
    import.meta.env.VITE_API_HISTORIAL,
    import.meta.env.VITE_API_UPLOAD,
    import.meta.env.VITE_API_GATEWAY_URL,
  ].filter(Boolean);

  for (const c of candidates) {
    const base = tryStageBase(c);
    if (base) return stripEnd(base);
  }

  console.error('[API] No pude resolver el API base. Define VITE_API_BASE_AVATARES="https://<apiId>.execute-api.<region>.amazonaws.com/<stage>"');
  return '';
}
