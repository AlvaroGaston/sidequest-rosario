import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { api } from "../lib/api";
import type { Paginated, Quest } from "../lib/types";
import { CATEGORIES, CATEGORY_INFO } from "../lib/quest-schema";
import { useSession } from "../lib/auth-client";
import { QuestCard } from "../components/QuestCard";
import { Spinner } from "../components/ui";

export function QuestsPage() {
  const [params, setParams] = useSearchParams();
  const { data: session } = useSession();
  const [result, setResult] = useState<Paginated<Quest> | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState(params.get("search") ?? "");

  const page = Number(params.get("page") ?? 1);
  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "";
  const neighborhood = params.get("neighborhood") ?? "";
  const difficulty = params.get("difficulty") ?? "";

  useEffect(() => {
    api.neighborhoods().then(setNeighborhoods).catch(() => {});
  }, []);

  useEffect(() => {
    if (!session) {
      setCompletedIds(new Set());
      return;
    }
    api
      .myCompletions()
      .then((r) => setCompletedIds(new Set(r.items.map((c) => c.quest?.id).filter(Boolean) as string[])))
      .catch(() => {});
  }, [session]);

  useEffect(() => {
    setResult(null);
    setError("");
    api
      .listQuests({ page, limit: 9, search, category, neighborhood, difficulty })
      .then(setResult)
      .catch((e: Error) => setError(e.message));
  }, [page, search, category, neighborhood, difficulty]);

  // Búsqueda con debounce de 400 ms.
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) updateParam("search", searchInput);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next);
  }

  function clearFilters() {
    setSearchInput("");
    setParams(new URLSearchParams());
  }

  const hasFilters = search || category || neighborhood || difficulty;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tablero de misiones</h1>
          <p className="muted">Elegí tu próxima aventura por Rosario.</p>
        </div>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="🔍 Buscar misión, lugar o barrio..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Buscar"
        />
        <select value={category} onChange={(e) => updateParam("category", e.target.value)} aria-label="Categoría">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_INFO[c].emoji} {CATEGORY_INFO[c].label}
            </option>
          ))}
        </select>
        <select value={neighborhood} onChange={(e) => updateParam("neighborhood", e.target.value)} aria-label="Barrio">
          <option value="">Todos los barrios</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <select value={difficulty} onChange={(e) => updateParam("difficulty", e.target.value)} aria-label="Dificultad">
          <option value="">Cualquier dificultad</option>
          {[1, 2, 3, 4, 5].map((d) => (
            <option key={d} value={d}>
              {"★".repeat(d)}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button className="btn btn-ghost" onClick={clearFilters}>
            Limpiar
          </button>
        )}
      </div>

      {error && <div className="alert">{error}</div>}
      {!result && !error && <Spinner />}

      {result && (
        <>
          <p className="muted results-count">
            {result.total} {result.total === 1 ? "misión encontrada" : "misiones encontradas"}
          </p>
          {result.items.length === 0 ? (
            <div className="empty-state">
              <div className="big-emoji">🗺️</div>
              <p>No hay misiones con esos filtros.</p>
            </div>
          ) : (
            <div className="quest-grid">
              {result.items.map((q) => (
                <QuestCard key={q.id} quest={q} completed={completedIds.has(q.id)} />
              ))}
            </div>
          )}
          {result.totalPages > 1 && (
            <nav className="pagination" aria-label="Paginación">
              <button className="btn btn-ghost" disabled={page <= 1} onClick={() => updateParam("page", String(page - 1))}>
                ← Anterior
              </button>
              <span>
                Página {result.page} de {result.totalPages}
              </span>
              <button
                className="btn btn-ghost"
                disabled={page >= result.totalPages}
                onClick={() => updateParam("page", String(page + 1))}
              >
                Siguiente →
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}
