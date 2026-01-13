import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:4321",
  output: "server",
  adapter: node({ mode: "standalone" }),
  server: {
    host: true
  },
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    server: {
      allowedHosts: ['lk8s0o440kskkcogwsccc8gg.victoriafp.online']
    },
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
