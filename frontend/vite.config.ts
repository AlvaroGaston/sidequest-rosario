import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En local, /api va al backend (Express en :3000). En Render lo hace el rewrite /api/*.
// Así el código del frontend es idéntico en los dos entornos.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
