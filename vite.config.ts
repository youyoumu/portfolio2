import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { resolve } from "path";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import webfontDownload from "vite-plugin-webfont-dl";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({ target: "solid", autoCodeSplitting: true }),
    solidPlugin(),
    tailwindcss(),
    webfontDownload([
      "https://fonts.googleapis.com/css2?family=Leckerli+One&family=Yuji+Syuku&display=swap",
    ]),
  ],
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
    },
  },
});
