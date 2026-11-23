import { auth, authDb } from "./lib/auth.js";
import { connectDb, disconnectDb } from "./db.js";
import { QuestModel } from "./models/quest.model.js";
import { CompletionModel } from "./models/completion.model.js";
import type { z } from "zod";
import type { createQuestSchema } from "./schemas/quest.schema.js";

// Usuarios de prueba (contraseñas solo para desarrollo / corrección del TP).
const USERS = [
  { name: "Game Master", email: "admin@sidequest.com", password: "Admin1234!", role: "admin" },
  { name: "Jugador Rosarino", email: "user@sidequest.com", password: "User1234!", role: "user" },
] as const;

const nextYear = new Date().getFullYear() + 1;

const QUESTS: Array<z.input<typeof createQuestSchema>> = [
  {
    title: "El lomito definitivo",
    description: "Probá un lomito completo en un bar de Pichincha y decidí si es el mejor de la ciudad.",
    category: "gastronomia",
    neighborhood: "Pichincha",
    difficulty: 2,
    xp: 150,
    estimatedMinutes: 90,
  },
  {
    title: "Atardecer en La Florida",
    description: "Llegá a la playa de La Florida antes de que baje el sol y mirá el atardecer sobre el Paraná.",
    category: "naturaleza",
    neighborhood: "Alberdi",
    difficulty: 1,
    xp: 80,
    estimatedMinutes: 60,
  },
  {
    title: "Subir al mirador del Monumento",
    description: "Subí a la torre del Monumento a la Bandera y sacá una foto panorámica de la costa.",
    category: "cultura",
    neighborhood: "Centro",
    difficulty: 2,
    xp: 120,
    estimatedMinutes: 60,
  },
  {
    title: "Cruzar a la isla en lancha",
    description: "Tomá la lancha desde la Estación Fluvial y pasá una tarde en las islas del Paraná.",
    category: "aventura",
    neighborhood: "Costanera",
    difficulty: 4,
    xp: 400,
    estimatedMinutes: 300,
    deadline: new Date(`${nextYear}-03-31T23:59:00-03:00`),
  },
  {
    title: "Feria de vinilos del domingo",
    description: "Recorré la feria de discos del domingo y volvé a casa con al menos un vinilo nuevo.",
    category: "social",
    neighborhood: "Centro",
    difficulty: 1,
    xp: 60,
    estimatedMinutes: 120,
  },
  {
    title: "Pizza y fainá después de las 2 AM",
    description: "Cerrá la noche con una porción de pizza y fainá de parado en una pizzería de Echesortu.",
    category: "nocturna",
    neighborhood: "Echesortu",
    difficulty: 3,
    xp: 200,
    estimatedMinutes: 45,
    isNight: true,
  },
  {
    title: "Bici por el Parque Independencia",
    description: "Dale la vuelta completa al lago del Parque Independencia en bici pública.",
    category: "aventura",
    neighborhood: "Parque Independencia",
    difficulty: 2,
    xp: 130,
    estimatedMinutes: 75,
  },
  {
    title: "Café en el Bar El Cairo",
    description: "Pedite un café en el bar más literario de Rosario y leé algo de Fontanarrosa.",
    category: "cultura",
    neighborhood: "Centro",
    difficulty: 1,
    xp: 70,
    estimatedMinutes: 60,
  },
  {
    title: "Ronda de mates en el Parque España",
    description: "Juntate con amigos a tomar mate en las escalinatas del Parque España mirando el río.",
    category: "social",
    neighborhood: "Centro",
    difficulty: 1,
    xp: 50,
    estimatedMinutes: 90,
  },
  {
    title: "Kayak en el Paraná",
    description: "Alquilá un kayak en la costa norte y remá al menos una hora por el río.",
    category: "aventura",
    neighborhood: "Alberdi",
    difficulty: 5,
    xp: 600,
    estimatedMinutes: 150,
    deadline: new Date(`${nextYear}-04-30T23:59:00-03:00`),
  },
  {
    title: "Recital en un bar de Pichincha",
    description: "Andá a ver una banda en vivo a un bar chico de Pichincha y quedate hasta el último tema.",
    category: "nocturna",
    neighborhood: "Pichincha",
    difficulty: 3,
    xp: 220,
    estimatedMinutes: 180,
    isNight: true,
  },
  {
    title: "Picnic en el Rosedal",
    description: "Armá un picnic en el Rosedal del Parque Independencia en plena temporada de flores.",
    category: "naturaleza",
    neighborhood: "Parque Independencia",
    difficulty: 1,
    xp: 90,
    estimatedMinutes: 120,
    deadline: new Date(`${nextYear}-12-15T23:59:00-03:00`),
  },
];

async function ensureUser(u: (typeof USERS)[number]) {
  const users = authDb.collection("user");
  let existing = await users.findOne({ email: u.email });
  if (!existing) {
    await auth.api.signUpEmail({ body: { name: u.name, email: u.email, password: u.password } });
    existing = await users.findOne({ email: u.email });
    console.log(`👤 Usuario creado: ${u.email}`);
  } else {
    console.log(`👤 Usuario existente: ${u.email}`);
  }
  await users.updateOne({ email: u.email }, { $set: { role: u.role } });
  return { id: String(existing!._id), name: u.name };
}

async function main() {
  await connectDb();

  const [, player] = await Promise.all(USERS.map(ensureUser));

  await CompletionModel.deleteMany({});
  await QuestModel.deleteMany({});
  const quests = await QuestModel.insertMany(QUESTS);
  console.log(`🗺️  ${quests.length} misiones cargadas`);

  // Algunas misiones completadas para que el ranking no arranque vacío.
  const done = quests.slice(0, 3);
  await CompletionModel.insertMany(
    done.map((q) => ({ userId: player.id, userName: player.name, quest: q._id, xp: q.xp })),
  );
  console.log(`🏆 ${done.length} misiones completadas por ${player.name}`);

  await disconnectDb();
  console.log("✅ Seed terminado");
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDb().catch(() => {});
  process.exit(1);
});
