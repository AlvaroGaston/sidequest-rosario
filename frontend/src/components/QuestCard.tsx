import { Link } from "react-router";
import type { Quest } from "../lib/types";
import { CATEGORY_INFO } from "../lib/quest-schema";
import { formatMinutes } from "../lib/levels";
import { CategoryBadge, Stars } from "./ui";

export function QuestCard({ quest, completed = false }: { quest: Quest; completed?: boolean }) {
  const info = CATEGORY_INFO[quest.category];
  return (
    <Link
      to={`/quests/${quest.id}`}
      className={`quest-card${completed ? " completed" : ""}`}
      style={{ "--cat": info.color } as React.CSSProperties}
    >
      <div className="quest-card-art">
        {quest.imageUrl ? <img src={quest.imageUrl} alt="" loading="lazy" /> : <span className="art-emoji">{info.emoji}</span>}
        <span className="xp-chip">+{quest.xp} XP</span>
        {quest.isNight && <span className="night-chip">🌙 Nocturna</span>}
      </div>
      <div className="quest-card-body">
        <CategoryBadge category={quest.category} />
        <h3>{quest.title}</h3>
        <p className="muted">📍 {quest.neighborhood}</p>
        <div className="quest-card-foot">
          <Stars value={quest.difficulty} />
          <span className="muted">⏱ {formatMinutes(quest.estimatedMinutes)}</span>
        </div>
        {quest.deadline && <p className="season">🗓️ Temporada hasta {new Date(quest.deadline).toLocaleDateString("es-AR")}</p>}
        {completed && <span className="done-stamp">✓ Completada</span>}
      </div>
    </Link>
  );
}
