import { Router } from "express";
import { z } from "zod";
import { CompletionModel } from "../models/completion.model.js";

export const rankingRouter = Router();

// GET /api/ranking?limit=5: top de jugadores por XP (público).
rankingRouter.get("/", async (req, res) => {
  const limit = z.coerce.number().int().min(1).max(50).catch(5).parse(req.query.limit);
  const ranking = await CompletionModel.aggregate<{
    userId: string;
    name: string;
    totalXp: number;
    completed: number;
  }>([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$userId",
        name: { $first: "$userName" },
        totalXp: { $sum: "$xp" },
        completed: { $sum: 1 },
      },
    },
    { $sort: { totalXp: -1, completed: -1 } },
    { $limit: limit },
    { $project: { _id: 0, userId: "$_id", name: 1, totalXp: 1, completed: 1 } },
  ]);
  res.json(ranking);
});
