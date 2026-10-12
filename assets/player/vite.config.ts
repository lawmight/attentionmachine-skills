import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Run from the project with `npx vite player`. staticFile() paths resolve against the project's public/.
export default defineConfig({
  plugins: [react()],
  publicDir: "../public",
});
