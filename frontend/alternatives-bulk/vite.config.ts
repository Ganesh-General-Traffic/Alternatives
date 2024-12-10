import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/uploadFile": {
        target: "http://localhost:3000", // Flask backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
