/// <reference types="vitest" />

import path from "path";
import legacy from "@vitejs/plugin-legacy";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";


export default defineConfig({
  plugins: [
    react(),
    legacy(),
    tailwindcss(),
  ],

  envDir: path.resolve(__dirname, "../../web"),

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});