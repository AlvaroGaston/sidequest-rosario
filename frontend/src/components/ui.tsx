import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CATEGORY_INFO, type Category } from "../lib/quest-schema";
import { getLevel } from "../lib/levels";

export function Spinner({ label = "Cargando..." }: { label?: string }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function Stars({ value, max = 5 }: { value: number; max?: number }) {
  return (
    <span className="stars" aria-label={`Dificultad ${value} de ${max}`} title={`Dificultad ${value}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={i < value ? "star on" : "star"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  const info = CATEGORY_INFO[category];
  return (
    <span className="badge" style={{ "--cat": info.color } as React.CSSProperties}>
      {info.emoji} {info.label}
    </span>
  );
}

export function XpBar({ xp }: { xp: number }) {
  const level = getLevel(xp);
  return (
    <div className="xpbar-wrap">
      <div className="xpbar-head">
        <strong>
          {level.emoji} Nivel: {level.name}
        </strong>
        <span>
          {xp} XP{level.next ? ` · faltan ${level.next.min - xp} para ${level.next.name}` : " · ¡nivel máximo!"}
        </span>
      </div>
      <div className="xpbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(level.progress * 100)}>
        <div className="xpbar-fill" style={{ width: `${level.progress * 100}%` }} />
      </div>
    </div>
  );
}

function diffParts(target: number) {
  const ms = Math.max(0, target - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { ms, days, hours, minutes };
}

export function Countdown({ deadline }: { deadline: string }) {
  const target = new Date(deadline).getTime();
  const [parts, setParts] = useState(() => diffParts(target));
  useEffect(() => {
    const t = setInterval(() => setParts(diffParts(target)), 30_000);
    return () => clearInterval(t);
  }, [target]);
  if (parts.ms <= 0) return <div className="countdown expired">⌛ Misión vencida</div>;
  return (
    <div className="countdown">
      ⏳ Quedan <strong>{parts.days}</strong> días <strong>{parts.hours}</strong> h <strong>{parts.minutes}</strong> min
    </div>
  );
}

export function NoPermission() {
  return (
    <div className="empty-state">
      <div className="big-emoji">🔒</div>
      <h1>Sin permisos</h1>
      <p>Esta zona es solo para el Game Master. Tu personaje todavía no tiene el rol necesario.</p>
      <Link className="btn" to="/quests">
        Volver a las misiones
      </Link>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="field-error">{message}</p>;
}
