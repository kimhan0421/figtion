import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    target: "esnext",
    outDir: "../../dist",
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: {
      // @ts-expect-error - intentionally using unsupported field
      inlineDynamicImports: true,
    },
  },
});
