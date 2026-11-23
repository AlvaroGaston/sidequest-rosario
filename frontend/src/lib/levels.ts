export const LEVELS = [
  { name: "Novato", min: 0, emoji: "🐣" },
  { name: "Explorador", min: 300, emoji: "🧭" },
  { name: "Leyenda rosarina", min: 1000, emoji: "👑" },
] as const;

export function getLevel(xp: number) {
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (xp >= l.min) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  const progress = next ? (xp - current.min) / (next.min - current.min) : 1;
  return { ...current, index, next, progress: Math.min(1, Math.max(0, progress)) };
}

export function formatMinutes(min: number) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}
