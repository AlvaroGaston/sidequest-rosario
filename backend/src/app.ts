import express, { type ErrorRequestHandler } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth, enabledProviders } from "./lib/auth.js";
import { questsRouter } from "./routes/quests.routes.js";
import { completionsRouter } from "./routes/completions.routes.js";
import { rankingRouter } from "./routes/ranking.routes.js";

export const app = express();

// Render (y el proxy de Vite) están delante de Express.
app.set("trust proxy", 1);

// El handler de Better Auth va ANTES de express.json(): necesita el body crudo.
app.all("/api/auth/{*splat}", toNodeHandler(auth));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Qué proveedores sociales están configurados (el login muestra solo esos botones).
app.get("/api/providers", (_req, res) => {
  res.json(enabledProviders);
});

app.use("/api/quests", questsRouter);
app.use("/api/completions", completionsRouter);
app.use("/api/ranking", rankingRouter);

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: "JSON inválido" });
    return;
  }
  if (err?.name === "ValidationError" || err?.name === "CastError") {
    res.status(400).json({ error: "Datos inválidos", details: err.errors ?? err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
};
app.use(errorHandler);
