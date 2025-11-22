import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const root = process.cwd();
    const env = loadEnv(mode, root, '');

    return {
      // ====== DESENVOLVIMENTO ======
      server: {
        port: 3000,
        host: 'localhost',
        strictPort: false,
        open: true,
        // Configurar CORS seguro
        cors: {
          origin: ['http://localhost:3000', 'http://localhost:5173'],
          credentials: true,
        },
        // Headers de segurança
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        // Proxy para APIs (se necessário)
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/api/, ''),
          },
        },
      },

      // ====== PLUGINS ======
      plugins: [
        react({
          // Otimizações React
          jsxImportSource: 'react',
          babel: {
            compact: false,
          },
        }),
      ],

      // ====== VARIÁVEIS DE AMBIENTE ======
      define: {
        'process.env.VITE_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      },

      // ====== RESOLUÇÃO DE MÓDULOS ======
      resolve: {
        alias: {
          '@': path.resolve(root, './'),
        },
      },

      // ====== OTIMIZAÇÕES DE BUILD ======
      build: {
        target: 'ES2022',
        minify: 'terser',
        sourcemap: false, // Desabilitar sourcemaps em produção por segurança
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.logs em produção
            drop_debugger: true,
          },
          mangle: true,
        },
        rollupOptions: {
          output: {
            // Code Splitting automático
            manualChunks: {
              'vendor': ['react', 'react-dom', 'react-router-dom'],
              'supabase': ['@supabase/supabase-js'],
              'gemini': ['@google/genai'],
            },
          },
        },
        // Configurações de chunk
        chunkSizeWarningLimit: 500,
        cssCodeSplit: true,
        reportCompressedSize: false,
      },

      // ====== OTIMIZAÇÕES GERAIS ======
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom'],
        exclude: ['node_modules/.vite'],
      },

      // ====== CSS ======
      css: {
        postcss: {},
        modules: {
          localsConvention: 'camelCase',
        },
      },
    };
});
