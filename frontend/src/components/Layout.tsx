import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { signOut, useSession } from "../lib/auth-client";

export function Layout() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const isAdmin = session?.user.role === "admin";

  async function handleLogout() {
    await signOut();
    setOpen(false);
    navigate("/");
  }

  const close = () => setOpen(false);

  return (
    <div className="app">
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="logo" onClick={close}>
            <span className="logo-star">★</span>
            <span>
              SideQuest <small>Rosario</small>
            </span>
          </Link>
          <button className="menu-toggle" aria-label="Abrir menú" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            ☰
          </button>
          <nav className={`nav-links${open ? " open" : ""}`}>
            <NavLink to="/quests" onClick={close}>
              Misiones
            </NavLink>
            {session && (
              <NavLink to="/perfil" onClick={close}>
                Mi perfil
              </NavLink>
            )}
            {isAdmin && (
              <>
                <NavLink to="/admin" end onClick={close}>
                  Game Master
                </NavLink>
                <NavLink to="/admin/usuarios" onClick={close}>
                  Usuarios
                </NavLink>
              </>
            )}
            {isPending ? null : session ? (
              <div className="nav-user">
                <span className="nav-name" title={session.user.email}>
                  {isAdmin ? "👑" : "🎮"} {session.user.name}
                </span>
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  Salir
                </button>
              </div>
            ) : (
              <div className="nav-user">
                <Link className="btn btn-ghost btn-sm" to="/login" onClick={close}>
                  Entrar
                </Link>
                <Link className="btn btn-sm" to="/register" onClick={close}>
                  Crear personaje
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">SideQuest Rosario · TP 2 Full Stack · Hecho con Express, MongoDB y React</div>
      </footer>
    </div>
  );
}
