import { Router } from "express";
import { isValidObjectId } from "mongoose";
import { CompletionModel } from "../models/completion.model.js";
import { QuestModel } from "../models/quest.model.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { createCompletionSchema, zodError } from "../schemas/quest.schema.js";

export const completionsRouter = Router();

// Todas las rutas de completions requieren sesión (rol user o admin).
completionsRouter.use(authMiddleware);

// GET /api/completions/me: solo las del usuario logueado.
completionsRouter.get("/me", async (req, res) => {
  const items = await CompletionModel.find({ userId: req.user!.id })
    .sort({ createdAt: -1 })
    .populate("quest");
  const totalXp = items.reduce((sum, c) => sum + c.xp, 0);
  res.json({ items, totalXp, count: items.length });
});

// POST /api/completions { questId }
completionsRouter.post("/", async (req, res) => {
  const parsed = createCompletionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(zodError(parsed.error));
    return;
  }
  const quest = await QuestModel.findById(parsed.data.questId);
  if (!quest || !quest.isActive) {
    res.status(404).json({ error: "Misión no encontrada" });
    return;
  }
  const exists = await CompletionModel.exists({ userId: req.user!.id, quest: quest._id });
  if (exists) {
    res.status(409).json({ error: "Ya completaste esta misión" });
    return;
  }
  const completion = await CompletionModel.create({
    userId: req.user!.id,
    userName: req.user!.name || req.user!.email,
    quest: quest._id,
    xp: quest.xp,
  });
  res.status(201).json(completion);
});

// DELETE /api/completions/:id: solo el dueño del registro.
completionsRouter.delete("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Id inválido" });
    return;
  }
  const completion = await CompletionModel.findById(req.params.id);
  if (!completion) {
    res.status(404).json({ error: "Registro no encontrado" });
    return;
  }
  if (completion.userId !== req.user!.id) {
    res.status(403).json({ error: "Ese registro no es tuyo" });
    return;
  }
  await completion.deleteOne();
  res.status(204).end();
});
