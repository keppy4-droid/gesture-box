import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/gesture-box/",
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  build: { outDir: "dist-pages" },
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
});
