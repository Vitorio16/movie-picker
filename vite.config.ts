import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Required for project pages at https://<user>.github.io/random-prompt/
  base: "/random-prompt/",
});
