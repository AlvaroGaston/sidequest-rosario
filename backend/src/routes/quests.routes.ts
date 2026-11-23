import { Router } from "express";
import { isValidObjectId, type QueryFilter } from "mongoose";
import { QuestModel, type Quest } from "../models/quest.model.js";
import { CompletionModel } from "../models/completion.model.js";
import { authMiddleware, getRequestSession, requireRole } from "../middlewares/auth.middleware.js";
import {
  createQuestSchema,
  listQuestsQuerySchema,
  updateQuestSchema,
  zodError,
} from "../schemas/quest.schema.js";

export const questsRouter = Router();

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/quests?page=&limit=&search=&category=&neighborhood=&difficulty=
// Público. Solo un admin puede pedir también las inactivas con ?all=true.
questsRouter.get("/", async (req, res) => {
  const parsed = listQuestsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json(zodError(parsed.error));
    return;
  }
  const { page, limit, search, category, neighborhood, difficulty, all } = parsed.data;

  const filter: QueryFilter<Quest> = {};
  let includeInactive = false;
  if (all === "true") {
    const session = await getRequestSession(req);
    includeInactive = session?.user.role === "admin";
  }
  if (!includeInactive) filter.isActive = true;
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (neighborhood) filter.neighborhood = new RegExp(`^${escapeRegex(neighborhood)}$`, "i");
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ title: rx }, { description: rx }, { neighborhood: rx }];
  }

  const [items, total] = await Promise.all([
    QuestModel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    QuestModel.countDocuments(filter),
  ]);

  res.json({ items, page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

// GET /api/quests/neighborhoods: barrios con misiones activas (para el filtro del listado).
questsRouter.get("/neighborhoods", async (_req, res) => {
  const neighborhoods = await QuestModel.distinct("neighborhood", { isActive: true });
  res.json(neighborhoods.sort((a, b) => a.localeCompare(b, "es")));
});

// GET /api/quests/random: misión destacada al azar para la home.
questsRouter.get("/random", async (_req, res) => {
  const [doc] = await QuestModel.aggregate([{ $match: { isActive: true } }, { $sample: { size: 1 } }]);
  if (!doc) {
    res.status(404).json({ error: "Todavía no hay misiones" });
    return;
  }
  res.json(QuestModel.hydrate(doc));
});

// GET /api/quests/:id
questsRouter.get("/:id", async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Id inválido" });
    return;
  }
  const quest = await QuestModel.findById(req.params.id);
  if (!quest) {
    res.status(404).json({ error: "Misión no encontrada" });
    return;
  }
  res.json(quest);
});

// POST /api/quests (admin)
questsRouter.post("/", authMiddleware, requireRole("admin"), async (req, res) => {
  const parsed = createQuestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(zodError(parsed.error));
    return;
  }
  const quest = await QuestModel.create(parsed.data);
  res.status(201).json(quest);
});

// PATCH /api/quests/:id (admin)
questsRouter.patch("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Id inválido" });
    return;
  }
  const parsed = updateQuestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(zodError(parsed.error));
    return;
  }
  const data = parsed.data;
  // Si el cliente manda imageUrl vacío, se borra la imagen.
  const update: Record<string, unknown> = { $set: { ...data } };
  if ("imageUrl" in (req.body ?? {}) && data.imageUrl === undefined) {
    delete (update.$set as Record<string, unknown>).imageUrl;
    update.$unset = { imageUrl: 1 };
  }
  const quest = await QuestModel.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  });
  if (!quest) {
    res.status(404).json({ error: "Misión no encontrada" });
    return;
  }
  res.json(quest);
});

// DELETE /api/quests/:id (admin)
questsRouter.delete("/:id", authMiddleware, requireRole("admin"), async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    res.status(400).json({ error: "Id inválido" });
    return;
  }
  const quest = await QuestModel.findByIdAndDelete(req.params.id);
  if (!quest) {
    res.status(404).json({ error: "Misión no encontrada" });
    return;
  }
  await CompletionModel.deleteMany({ quest: quest._id });
  res.status(204).end();
});
