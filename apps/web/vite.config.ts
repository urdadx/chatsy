import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tailwindcss(),
    tanstackStart({
      target: "node-server",
      customViteReactPlugin: true,
    }),
    react(),
  ],

  optimizeDeps: {
    exclude: ["@polar-sh/sdk/webhooks.ts"],
  },
  server: {
    allowedHosts: [
      "padyna.railway.internal",
      "adjusted-strictly-newt.ngrok-free.app",
      "padyna.com",
    ],
  },
});
