import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { signIn } from "../lib/auth-client";

const PROVIDERS = [
  { id: "github", label: "Entrar con GitHub", icon: "🐙" },
  { id: "google", label: "Entrar con Google", icon: "🟢" },
] as const;

export function SocialButtons({ redirect }: { redirect: string }) {
  const [enabled, setEnabled] = useState<string[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    api.providers().then(setEnabled).catch(() => setEnabled([]));
  }, []);

  async function login(provider: "github" | "google") {
    // Un solo intento a la vez: un segundo clic invalidaría el "state" del primero.
    if (busy) return;
    setBusy(provider);
    setError("");
    const { error } = await signIn.social({
      provider,
      callbackURL: window.location.origin + redirect,
      errorCallbackURL: window.location.origin + "/login",
    });
    if (error) {
      setError(error.message ?? "No se pudo iniciar sesión");
      setBusy(null);
    }
  }

  return (
    <div className="social">
      {PROVIDERS.map((p) => {
        const isEnabled = enabled?.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            className={`btn btn-social ${p.id}`}
            onClick={() => login(p.id)}
            disabled={!isEnabled || busy !== null}
            title={isEnabled ? p.label : `${p.label}: falta configurar las credenciales en el backend`}
          >
            <span aria-hidden>{p.icon}</span> {busy === p.id ? "Conectando..." : p.label}
          </button>
        );
      })}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
