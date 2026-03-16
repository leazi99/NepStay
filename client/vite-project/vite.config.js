import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;

          if (id.includes("framer-motion")) return "motion";
          if (id.includes("react-hot-toast") || id.includes("react-toastify"))
            return "notifications";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("moment")) return "date-utils";
          if (id.includes("/react/") || id.includes("/react-dom/"))
            return "react-vendor";

          return "vendor";
        },
      },
    },
  },
});
