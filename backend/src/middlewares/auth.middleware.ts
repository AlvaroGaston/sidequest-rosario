import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

type Session = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: Session["user"];
      session?: Session["session"];
    }
  }
}

/** Lee la sesión de Better Auth (sin exigirla). */
export async function getRequestSession(req: Request) {
  return auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
}

/** Exige sesión iniciada: sin sesión responde 401. */
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const session = await getRequestSession(req);
  if (!session) {
    res.status(401).json({ error: "No autenticado: iniciá sesión para continuar" });
    return;
  }
  req.user = session.user;
  req.session = session.session;
  next();
}

/** Exige un rol (usar después de authMiddleware): si no coincide responde 403. */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role ?? "user";
    if (!roles.includes(role)) {
      res.status(403).json({ error: "Sin permisos para realizar esta acción" });
      return;
    }
    next();
  };
}
