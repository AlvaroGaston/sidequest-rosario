import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import type { Completion } from "../lib/types";
import { useSession } from "../lib/auth-client";
import { CategoryBadge, Spinner, XpBar } from "../components/ui";

export function ProfilePage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Completion[] | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [error, setError] = useState("");

  async function load() {
    try {
      const r = await api.myCompletions();
      setItems(r.items);
      setTotalXp(r.totalXp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function remove(c: Completion) {
    if (!confirm(`¿Quitar "${c.quest?.title ?? "esta misión"}" de tus completadas? Perdés ${c.xp} XP.`)) return;
    try {
      await api.deleteCompletion(c.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  return (
    <>
      <div className="profile-head">
        <div className="avatar">{session?.user.name?.[0]?.toUpperCase() ?? "?"}</div>
        <div>
          <h1>{session?.user.name}</h1>
          <p className="muted">
            {session?.user.email} · rol <strong>{session?.user.role ?? "user"}</strong>
          </p>
        </div>
      </div>

      <XpBar xp={totalXp} />

      <h2 className="section-title">📜 Mis misiones completadas</h2>
      {error && <div className="alert">{error}</div>}
      {!items && !error && <Spinner />}
      {items && items.length === 0 && (
        <div className="empty-state">
          <div className="big-emoji">🎒</div>
          <p>Todavía no completaste ninguna misión.</p>
          <Link className="btn" to="/quests">
            Buscar una misión
          </Link>
        </div>
      )}
      {items && items.length > 0 && (
        <ul className="completion-list">
          {items.map((c) => (
            <li key={c.id}>
              <div>
                {c.quest ? (
                  <>
                    <Link to={`/quests/${c.quest.id}`}>
                      <strong>{c.quest.title}</strong>
                    </Link>{" "}
                    <CategoryBadge category={c.quest.category} />
                  </>
                ) : (
                  <strong>Misión eliminada</strong>
                )}
                <p className="muted">Completada el {new Date(c.createdAt).toLocaleDateString("es-AR")}</p>
              </div>
              <span className="xp-text">+{c.xp} XP</span>
              <button className="btn btn-ghost btn-sm" onClick={() => remove(c)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
