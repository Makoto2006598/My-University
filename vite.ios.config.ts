import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for building the iOS-bundled version.
// Uses relative paths (base: './') so assets can be loaded
// from the local filesystem inside WKWebView.
export default defineConfig({
    base: './',
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        }
    },
    build: {
        outDir: 'dist-ios',
        emptyOutDir: true,
    },
});
