import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// Sin baseURL absoluta: usa el mismo origen del frontend, así todo pasa por /api
// (proxy de Vite en local, rewrite de Render en producción) y la cookie queda en el mismo dominio.
export const authClient = createAuthClient({
  basePath: "/api/auth",
  plugins: [adminClient()],
});

export const { useSession, signIn, signUp, signOut } = authClient;
