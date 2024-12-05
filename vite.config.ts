import {defineConfig} from "vite";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react"
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  server: {
    host: "127.0.0.1",
    port: 3000
  },
  resolve: {
    alias: {
      "@Root": "/src",
      "@Workers": "/src/workers"
    }
  },
  plugins: [
    react(),
    wasm(),
    topLevelAwait()
  ],
});
