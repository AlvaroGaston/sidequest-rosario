import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../lib/api";
import type { Quest, RankingEntry } from "../lib/types";
import { QuestCard } from "../components/QuestCard";
import { Spinner } from "../components/ui";
import { getLevel } from "../lib/levels";

export function HomePage() {
  const [featured, setFeatured] = useState<Quest | null>(null);
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function rollQuest() {
    try {
      setFeatured(await api.randomQuest());
    } catch {
      setFeatured(null);
    }
  }

  useEffect(() => {
    Promise.allSettled([rollQuest(), api.ranking(5).then(setRanking)]).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <p className="eyebrow">Misiones secundarias de la vida real</p>
        <h1>¿Qué misión hacés hoy?</h1>
        <p className="hero-sub">
          Lomitos legendarios, atardeceres en la costanera y noches de pizza y fainá. Completá misiones por Rosario,
          sumá XP y convertite en <strong>Leyenda rosarina</strong>.
        </p>
        <div className="hero-actions">
          <Link to="/quests" className="btn btn-lg">
            Ver todas las misiones
          </Link>
          <button className="btn btn-ghost btn-lg" onClick={rollQuest}>
            🎲 Otra misión al azar
          </button>
        </div>
      </section>

      {loading ? (
        <Spinner />
      ) : (
        <div className="home-grid">
          <section>
            <h2 className="section-title">⭐ Misión destacada</h2>
            {featured ? (
              <QuestCard quest={featured} />
            ) : (
              <p className="muted">Todavía no hay misiones publicadas.</p>
            )}
          </section>
          <section>
            <h2 className="section-title">🏆 Top 5 jugadores</h2>
            {ranking.length === 0 ? (
              <p className="muted">Nadie completó misiones todavía. ¡Sé el primero!</p>
            ) : (
              <ol className="ranking">
                {ranking.map((r, i) => (
                  <li key={r.userId} className={`rank-${i + 1}`}>
                    <span className="rank-pos">{["🥇", "🥈", "🥉"][i] ?? `#${i + 1}`}</span>
                    <span className="rank-name">
                      {r.name}
                      <small>
                        {getLevel(r.totalXp).name} · {r.completed} misiones
                      </small>
                    </span>
                    <span className="rank-xp">{r.totalXp} XP</span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </>
  );
}
