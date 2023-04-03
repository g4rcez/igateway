import { defineConfig } from "vite";

export default defineConfig({
    plugins: [],
    build: {
        emptyOutDir: false,
        sourcemap: true,
        outDir: "./dist",
        lib: {
            name: "igateway",
            entry: "./src/index.ts",
            fileName: "igateway",
            formats: ["cjs", "es", "umd"],
        },
        rollupOptions: {
            external: ["react/jsx-runtime", "react"],
        },
    },
});
