import { defineConfig } from "vite";

export default defineConfig({
  root: "./packages/widget",
  build: {
    target: "esnext",
    outDir: "../../dist",
    lib: {
      entry: "src/code.tsx",
      formats: ["iife"], // Figma가 IIFE 포맷만 지원
      fileName: () => "code.js",
    },
    rollupOptions: {
      // @ts-expect-error - intentionally using unsupported field
      inlineDynamicImports: true,
    },
  },
});
