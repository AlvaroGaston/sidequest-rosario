import type { Category } from "./quest-schema";

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: Category;
  neighborhood: string;
  difficulty: number;
  xp: number;
  estimatedMinutes: number;
  deadline?: string | null;
  isNight: boolean;
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Completion {
  id: string;
  userId: string;
  quest: Quest | null;
  xp: number;
  createdAt: string;
}

export interface RankingEntry {
  userId: string;
  name: string;
  totalXp: number;
  completed: number;
}
