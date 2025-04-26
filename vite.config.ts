import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5072", // Replace with your server's URL
        changeOrigin: true,
      },
    },
  },
});
