import { z } from "zod";

// Mismas reglas que backend/src/schemas/quest.schema.ts, adaptadas a los valores del formulario.
export const CATEGORIES = [
  "gastronomia",
  "aventura",
  "cultura",
  "naturaleza",
  "social",
  "nocturna",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_INFO: Record<Category, { label: string; emoji: string; color: string }> = {
  gastronomia: { label: "Gastronomía", emoji: "🍔", color: "#ff8a3d" },
  aventura: { label: "Aventura", emoji: "🧭", color: "#3ddc84" },
  cultura: { label: "Cultura", emoji: "🏛️", color: "#7c8cff" },
  naturaleza: { label: "Naturaleza", emoji: "🌅", color: "#2ec4b6" },
  social: { label: "Social", emoji: "🎉", color: "#ff5fa2" },
  nocturna: { label: "Nocturna", emoji: "🌙", color: "#b06bff" },
};

const int = (label: string, min: number, max: number) =>
  z
    .number({ error: `${label} tiene que ser un número` })
    .int(`${label} tiene que ser un número entero`)
    .min(min, `Mínimo ${min}`)
    .max(max, `Máximo ${max}`);

export const makeQuestFormSchema = (isNew: boolean) =>
  z.object({
    title: z.string().trim().min(3, "Mínimo 3 caracteres").max(80, "Máximo 80 caracteres"),
    description: z.string().trim().min(10, "Mínimo 10 caracteres").max(500, "Máximo 500 caracteres"),
    category: z.enum(CATEGORIES, { error: "Elegí una categoría" }),
    neighborhood: z.string().trim().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
    difficulty: int("La dificultad", 1, 5),
    xp: int("La XP", 10, 1000),
    estimatedMinutes: int("La duración", 5, 600),
    deadline: z
      .string()
      .refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Fecha inválida")
      .refine((v) => !isNew || !v || new Date(`${v}T23:59:59`).getTime() > Date.now(), "La fecha límite tiene que ser futura"),
    isNight: z.boolean(),
    isActive: z.boolean(),
    imageUrl: z.union([z.string().trim().url("URL inválida"), z.literal("")]),
  });

export type QuestFormValues = z.infer<ReturnType<typeof makeQuestFormSchema>>;

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Mínimo 2 caracteres").max(50, "Máximo 50 caracteres"),
    email: z.string().trim().email("Email inválido"),
    password: z.string().min(8, "Mínimo 8 caracteres").max(128, "Máximo 128 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
