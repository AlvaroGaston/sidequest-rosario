import { useEffect, useState } from "react";
import { authClient, useSession } from "../../lib/auth-client";
import { Spinner } from "../../components/ui";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  createdAt: Date | string;
}

export function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  async function load() {
    const { data, error } = await authClient.admin.listUsers({
      query: { limit: 100, sortBy: "createdAt", sortDirection: "desc" },
    });
    if (error) setError(error.message ?? "No se pudieron cargar los usuarios");
    else setUsers(data.users as AdminUser[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function changeRole(user: AdminUser, role: "user" | "admin") {
    setSavingId(user.id);
    setNotice("");
    setError("");
    const { error } = await authClient.admin.setRole({ userId: user.id, role });
    setSavingId(null);
    if (error) {
      setError(error.message ?? "No se pudo cambiar el rol");
      return;
    }
    setNotice(`${user.name} ahora es ${role}`);
    await load();
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>👥 Usuarios</h1>
          <p className="muted">Asigná quién puede ser Game Master.</p>
        </div>
      </div>
      {error && <div className="alert">{error}</div>}
      {notice && <p className="toast">{notice}</p>}
      {!users && !error && <Spinner />}
      {users && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Alta</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === session?.user.id;
                return (
                  <tr key={u.id}>
                    <td>
                      {u.name} {isMe && <span className="pill on">vos</span>}
                    </td>
                    <td>{u.email}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString("es-AR")}</td>
                    <td>
                      <select
                        value={u.role ?? "user"}
                        disabled={isMe || savingId === u.id}
                        title={isMe ? "No podés quitarte el rol de admin a vos mismo" : undefined}
                        onChange={(e) => changeRole(u, e.target.value as "user" | "admin")}
                        aria-label={`Rol de ${u.name}`}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
