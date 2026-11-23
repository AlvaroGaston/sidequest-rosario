import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "../lib/auth-client";
import { NoPermission, Spinner } from "./ui";

interface Props {
  children: ReactNode;
  /** Si se indica, además de estar logueado hay que tener este rol. */
  role?: "admin" | "user";
}

export function ProtectedRoute({ children, role }: Props) {
  const { data: session, isPending } = useSession();
  const location = useLocation();

  if (isPending) return <Spinner label="Revisando tu sesión..." />;

  if (!session) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (role === "admin" && session.user.role !== "admin") {
    return <NoPermission />;
  }

  return <>{children}</>;
}
