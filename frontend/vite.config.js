import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const values = loadEnv(mode, process.cwd(), "");
  const apiUrl = values.VITE_API_URL?.trim();

  if (mode === "production") {
    if (!apiUrl) {
      throw new Error("VITE_API_URL es requerida para compilar en producción");
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(apiUrl);
    } catch {
      throw new Error("VITE_API_URL debe ser una URL válida");
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("VITE_API_URL debe utilizar HTTP o HTTPS");
    }
  }

  return {
    plugins: [react()],
  };
});
