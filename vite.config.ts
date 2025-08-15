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
      "https://fonts.googleapis.com/css2?family=Bitcount+Single:wght@100..900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Yuji+Syuku&display=swap",
    ]),
  ],
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
    },
  },
});
