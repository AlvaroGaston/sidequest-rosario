import { useEffect, useState } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";
import type { Paginated, Quest } from "../../lib/types";
import { CategoryBadge, Spinner, Stars } from "../../components/ui";

export function AdminPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [result, setResult] = useState<Paginated<Quest> | null>(null);
  const [error, setError] = useState("");
  const [toDelete, setToDelete] = useState<Quest | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setError("");
    try {
      setResult(await api.listQuests({ page, limit: 10, search, all: true }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  }

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await api.deleteQuest(toDelete.id);
      setToDelete(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>👑 Panel del Game Master</h1>
          <p className="muted">Publicá, editá y retirá misiones del tablero.</p>
        </div>
        <Link className="btn" to="/admin/quests/new">
          + Nueva misión
        </Link>
      </div>

      <div className="filters">
        <input
          type="search"
          placeholder="🔍 Buscar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {error && <div className="alert">{error}</div>}
      {!result && !error && <Spinner />}
      {result && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Misión</th>
                <th>Categoría</th>
                <th>Barrio</th>
                <th>Dificultad</th>
                <th>XP</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {result.items.map((q) => (
                <tr key={q.id}>
                  <td>
                    <Link to={`/quests/${q.id}`}>{q.title}</Link>
                    {q.isNight && " 🌙"}
                  </td>
                  <td>
                    <CategoryBadge category={q.category} />
                  </td>
                  <td>{q.neighborhood}</td>
                  <td>
                    <Stars value={q.difficulty} />
                  </td>
                  <td className="xp-text">{q.xp}</td>
                  <td>{q.isActive ? <span className="pill on">Activa</span> : <span className="pill off">Inactiva</span>}</td>
                  <td className="row-actions">
                    <Link className="btn btn-ghost btn-sm" to={`/admin/quests/${q.id}/edit`}>
                      Editar
                    </Link>
                    <button className="btn btn-danger btn-sm" onClick={() => setToDelete(q)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {result.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted center">
                    No hay misiones.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {result && result.totalPages > 1 && (
        <nav className="pagination">
          <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ← Anterior
          </button>
          <span>
            Página {result.page} de {result.totalPages}
          </span>
          <button className="btn btn-ghost" disabled={page >= result.totalPages} onClick={() => setPage(page + 1)}>
            Siguiente →
          </button>
        </nav>
      )}

      {toDelete && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="del-title">
          <div className="modal">
            <h2 id="del-title">¿Eliminar misión?</h2>
            <p>
              Vas a eliminar <strong>{toDelete.title}</strong>. También se borran los registros de quienes la completaron.
              Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setToDelete(null)} disabled={deleting}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
