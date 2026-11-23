import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="empty-state">
      <div className="big-emoji">🧭</div>
      <p className="pixel">404</p>
      <h1>Te fuiste del mapa</h1>
      <p className="muted">Esta zona no existe o la misión ya no está disponible.</p>
      <Link className="btn" to="/">
        Volver al inicio
      </Link>
    </div>
  );
}
