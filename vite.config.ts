import {defineConfig} from "vite";
import wasm from "vite-plugin-wasm";
import mkCert from "vite-plugin-mkcert";
import react from "@vitejs/plugin-react"
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
    server: {
        host: "127.0.0.1",
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
    plugins: [
        react(),
        wasm(),
        mkCert(),
        topLevelAwait()
    ],
    optimizeDeps: {
        exclude: [
            "onnxruntime-web",
            "subtitle-webapp-rust-crate"
        ]
    }
});
