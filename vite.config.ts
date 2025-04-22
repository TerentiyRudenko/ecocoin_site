import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(), // React plugin for JSX/TSX support
    basicSsl({
      /** name of certification */
      name: 'test',
      /** custom trust domains */
      domains: ['*.custom.com'],
      /** custom certification directory */
      certDir: '/Users/.../.devServer/cert', // Replace with your actual path
    }),
  ],
  define: {
    // Set global to globalThis for browser compatibility
    global: 'globalThis',
  },
  resolve: {
    alias: {
      // Polyfill buffer with the browser-compatible buffer package
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    include: [
      '@solana/wallet-adapter-base',
      '@solana/wallet-adapter-react',
      '@solana/wallet-adapter-react-ui',
      '@solana/wallet-adapter-wallets',
      '@solana/web3.js',
      '@solana/spl-token', // Include spl-token for pre-bundling
      'buffer', // Include buffer for pre-bundling
    ],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  server: {
    port: 5173, // Explicitly set port
    https: true, // Enable HTTPS (redundant with basicSsl but kept for clarity)
  },
});