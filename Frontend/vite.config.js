import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };

  if (mode === 'development') {
    config.define = {
      'import.meta.env.VITE_API_URL': JSON.stringify('http://localhost:3000')
    };
  }

  return config;
})
