import type { Completion, Paginated, Quest, RankingEntry } from "./types";

export class ApiError extends Error {
  status: number;
  details?: Record<string, string[] | undefined>;
  constructor(status: number, message: string, details?: Record<string, string[] | undefined>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Todas las llamadas usan rutas relativas /api con credentials: "include". */
export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error ?? `Error ${res.status}`,
      typeof data?.details === "object" ? data.details : undefined,
    );
  }
  return data as T;
}

export interface QuestFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  neighborhood?: string;
  difficulty?: string | number;
  all?: boolean;
}

export const api = {
  listQuests(filters: QuestFilters = {}) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== false) params.set(k, String(v));
    });
    return apiFetch<Paginated<Quest>>(`/quests?${params}`);
  },
  getQuest: (id: string) => apiFetch<Quest>(`/quests/${id}`),
  randomQuest: () => apiFetch<Quest>("/quests/random"),
  neighborhoods: () => apiFetch<string[]>("/quests/neighborhoods"),
  createQuest: (body: unknown) => apiFetch<Quest>("/quests", { method: "POST", body: JSON.stringify(body) }),
  updateQuest: (id: string, body: unknown) =>
    apiFetch<Quest>(`/quests/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteQuest: (id: string) => apiFetch<void>(`/quests/${id}`, { method: "DELETE" }),

  myCompletions: () => apiFetch<{ items: Completion[]; totalXp: number; count: number }>("/completions/me"),
  completeQuest: (questId: string) =>
    apiFetch<Completion>("/completions", { method: "POST", body: JSON.stringify({ questId }) }),
  deleteCompletion: (id: string) => apiFetch<void>(`/completions/${id}`, { method: "DELETE" }),

  ranking: (limit = 5) => apiFetch<RankingEntry[]>(`/ranking?limit=${limit}`),
  providers: () => apiFetch<string[]>("/providers"),
};
