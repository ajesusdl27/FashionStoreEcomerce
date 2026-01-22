import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "http://localhost:4321",
  output: "server",
  adapter: node({ mode: "standalone" }),
  server: {
    host: process.env.HOST || "0.0.0.0",
    port: parseInt(process.env.PORT || "4321")
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    server: {
      allowedHosts: [
        'lk8s0o440kskkcogwsccc8gg.victoriafp.online',
        'fashionstoreajesusdl.victoriafp.online'
      ]
    },
    resolve: {
      alias: {
        "@": "/src",
      },
      dedupe: ['react', 'react-dom'],
    },
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
});
