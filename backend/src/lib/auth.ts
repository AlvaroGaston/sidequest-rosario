import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { admin } from "better-auth/plugins";
import { MongoClient } from "mongodb";
import { env } from "../config/env.js";

// Cliente nativo de Mongo para Better Auth (usuarios, sesiones y cuentas).
// Mongoose usa su propia conexión para Quest y Completion.
export const mongoClient = new MongoClient(env.MONGODB_URI);
export const authDb = mongoClient.db();

// Los proveedores sociales se habilitan solo si están sus credenciales,
// así el proyecto arranca en local aunque no tengas la OAuth App creada.
const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};
if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
  };
}
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  // BETTER_AUTH_URL apunta al FRONTEND: Better Auth se usa a través del
  // proxy de Vite (local) o del rewrite /api/* de Render (producción).
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  basePath: "/api/auth",
  trustedOrigins: [env.FRONTEND_URL],
  // Sin `client` no se usan transacciones: así funciona tanto con Atlas como con un mongod local standalone.
  database: mongodbAdapter(authDb),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  socialProviders,
  plugins: [
    // Agrega el campo `role` (default "user") y los endpoints de admin (setRole, listUsers...).
    admin({ defaultRole: "user", adminRoles: ["admin"] }),
  ],
});

export const enabledProviders = Object.keys(socialProviders);
