import { z } from "zod";

export const CATEGORIES = [
  "gastronomia",
  "aventura",
  "cultura",
  "naturaleza",
  "social",
  "nocturna",
] as const;

export type Category = (typeof CATEGORIES)[number];

const int = (label: string, min: number, max: number) =>
  z
    .number({ error: `${label} tiene que ser un número` })
    .int(`${label} tiene que ser un número entero`)
    .min(min, `Mínimo ${min}`)
    .max(max, `Máximo ${max}`);

// Campos base, sin defaults: así `.partial()` en PATCH no pisa valores que no se mandan.
export const questBaseSchema = z.object({
  title: z.string({ error: "El título es obligatorio" }).trim().min(3, "Mínimo 3 caracteres").max(80, "Máximo 80 caracteres"),
  description: z
    .string({ error: "La descripción es obligatoria" })
    .trim()
    .min(10, "Mínimo 10 caracteres")
    .max(500, "Máximo 500 caracteres"),
  category: z.enum(CATEGORIES, { error: `Categoría inválida (${CATEGORIES.join(", ")})` }),
  neighborhood: z.string({ error: "El barrio es obligatorio" }).trim().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
  difficulty: int("La dificultad", 1, 5),
  xp: int("La XP", 10, 1000),
  estimatedMinutes: int("La duración", 5, 600),
  deadline: z.coerce.date({ error: "Fecha inválida" }).nullable().optional(),
  isNight: z.boolean({ error: "isNight tiene que ser true o false" }),
  isActive: z.boolean({ error: "isActive tiene que ser true o false" }),
  imageUrl: z
    .union([z.string().trim().url("URL inválida"), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export const createQuestSchema = questBaseSchema
  .extend({
    isNight: questBaseSchema.shape.isNight.default(false),
    isActive: questBaseSchema.shape.isActive.default(true),
  })
  .refine((q) => !q.deadline || q.deadline.getTime() > Date.now(), {
    message: "La fecha límite tiene que ser futura",
    path: ["deadline"],
  });

export const updateQuestSchema = questBaseSchema.partial();

export type CreateQuestInput = z.infer<typeof createQuestSchema>;
export type UpdateQuestInput = z.infer<typeof updateQuestSchema>;

export const listQuestsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(9),
  search: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORIES).optional(),
  neighborhood: z.string().trim().max(50).optional(),
  difficulty: z.coerce.number().int().min(1).max(5).optional(),
  all: z.enum(["true", "false"]).optional(),
});

export const createCompletionSchema = z.object({
  questId: z.string({ error: "questId es obligatorio" }).regex(/^[a-f\d]{24}$/i, "questId inválido"),
});

/** Formato de error 400 común a toda la API. */
export function zodError(error: z.ZodError) {
  const flat = z.flattenError(error);
  return {
    error: "Datos inválidos",
    details: { ...flat.fieldErrors, ...(flat.formErrors.length ? { _form: flat.formErrors } : {}) },
  };
}
