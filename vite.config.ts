import {defineConfig} from "vite";
import wasm from "vite-plugin-wasm";
import mkCert from "vite-plugin-mkcert";
import react from "@vitejs/plugin-react"
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    server: {
        host: "10.150.115.16",
        port: 3000,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        }
    },
    resolve: {
        alias: {
            "@R": "/src",
        }
    },
    worker: {
      format: "es",
    },
    plugins: [
        react(),
        wasm(),
        mkCert(),
        topLevelAwait({
            // The export name of top-level await promise for each chunk module
            promiseExportName: "__tla",
            // The function to generate import names of top-level await promise in each chunk module
            promiseImportName: i => `__tla_${i}`
        })
    ],
    optimizeDeps: {
        exclude: [
            "onnxruntime-web",
            "subtitle-webapp-rust-crate"
        ]
    }
});
