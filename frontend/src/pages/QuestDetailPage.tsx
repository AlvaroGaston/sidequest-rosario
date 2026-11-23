import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api, ApiError } from "../lib/api";
import type { Completion, Quest } from "../lib/types";
import { CATEGORY_INFO } from "../lib/quest-schema";
import { formatMinutes } from "../lib/levels";
import { useSession } from "../lib/auth-client";
import { CategoryBadge, Countdown, Spinner, Stars } from "../components/ui";
import { NotFoundPage } from "./NotFoundPage";

export function QuestDetailPage() {
  const { id = "" } = useParams();
  const { data: session, isPending } = useSession();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "notfound" | "error">("loading");
  const [completion, setCompletion] = useState<Completion | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setStatus("loading");
    api
      .getQuest(id)
      .then((q) => {
        setQuest(q);
        setStatus("ok");
      })
      .catch((e) => setStatus(e instanceof ApiError && (e.status === 404 || e.status === 400) ? "notfound" : "error"));
  }, [id]);

  useEffect(() => {
    if (!session) {
      setCompletion(null);
      return;
    }
    api
      .myCompletions()
      .then((r) => setCompletion(r.items.find((c) => c.quest?.id === id) ?? null))
      .catch(() => {});
  }, [session, id]);

  async function complete() {
    setBusy(true);
    setMessage("");
    try {
      const c = await api.completeQuest(id);
      setCompletion(c);
      setMessage(`¡Misión cumplida! +${c.xp} XP 🎉`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo registrar");
    } finally {
      setBusy(false);
    }
  }

  async function undo() {
    if (!completion) return;
    setBusy(true);
    setMessage("");
    try {
      await api.deleteCompletion(completion.id);
      setCompletion(null);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo deshacer");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return <Spinner />;
  if (status === "notfound") return <NotFoundPage />;
  if (status === "error" || !quest) return <div className="alert">No se pudo cargar la misión.</div>;

  const info = CATEGORY_INFO[quest.category];

  return (
    <article className="detail" style={{ "--cat": info.color } as React.CSSProperties}>
      <Link to="/quests" className="back-link">
        ← Volver al tablero
      </Link>
      <div className="detail-card">
        <div className="detail-art">
          {quest.imageUrl ? <img src={quest.imageUrl} alt={quest.title} /> : <span className="art-emoji big">{info.emoji}</span>}
        </div>
        <div className="detail-body">
          <div className="chips">
            <CategoryBadge category={quest.category} />
            {quest.isNight && <span className="badge night">🌙 Nocturna</span>}
            {!quest.isActive && <span className="badge inactive">Inactiva</span>}
          </div>
          <h1>{quest.title}</h1>
          <p className="detail-desc">{quest.description}</p>

          <dl className="stats">
            <div>
              <dt>Recompensa</dt>
              <dd className="xp-text">+{quest.xp} XP</dd>
            </div>
            <div>
              <dt>Dificultad</dt>
              <dd>
                <Stars value={quest.difficulty} />
              </dd>
            </div>
            <div>
              <dt>Duración</dt>
              <dd>⏱ {formatMinutes(quest.estimatedMinutes)}</dd>
            </div>
            <div>
              <dt>Barrio</dt>
              <dd>📍 {quest.neighborhood}</dd>
            </div>
          </dl>

          {quest.deadline && <Countdown deadline={quest.deadline} />}

          <div className="detail-actions">
            {isPending ? null : !session ? (
              <Link className="btn btn-lg" to={`/login?redirect=/quests/${quest.id}`}>
                Iniciá sesión para completar esta misión
              </Link>
            ) : completion ? (
              <>
                <span className="done-stamp big">✓ Misión completada</span>
                <button className="btn btn-ghost" onClick={undo} disabled={busy}>
                  Deshacer
                </button>
              </>
            ) : (
              <button className="btn btn-lg" onClick={complete} disabled={busy || !quest.isActive}>
                {busy ? "Registrando..." : "✅ Completé esta misión"}
              </button>
            )}
          </div>
          {message && <p className="toast">{message}</p>}
        </div>
      </div>
    </article>
  );
}
