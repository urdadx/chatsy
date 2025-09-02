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
      target: "node-server",
    }),
  ],
  server: {
    allowedHosts: ["chatsy.railway.internal", "adjusted-strictly-newt.ngrok-free.app"],
  },
});
