import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),

    tailwindcss(),
    tanstackStart({
      customViteReactPlugin: false,
      target: "node-server",
    }),
  ],
  server: {
    allowedHosts: ["32407ebb7f65.ngrok-free.app"],
  },
});
