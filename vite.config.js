// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/hf-image': { 
        // TARGET REMAINS THE NEW ROUTER BASE:
        target: 'https://router.huggingface.co', 
        changeOrigin: true, 
        
        // ⚠️ NEW REWRITE: 
        // It converts: /hf-image/stabilityai/stable-diffusion-2-1
        // TO:           /hf-inference/models/stabilityai/stable-diffusion-2-1
        rewrite: (path) => path.replace(/^\/hf-image/, '/hf-inference/models'), 
      },
    },
  },
});