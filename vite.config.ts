// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(), // Добавляем плагин для React
    basicSsl({
      /** name of certification */
      name: 'test',
      /** custom trust domains */
      domains: ['*.custom.com'],
      /** custom certification directory */
      certDir: '/Users/.../.devServer/cert', // Замените на реальный путь
    }),
  ],
  server: {
    port: 5173, // Указываем порт явно
    https: true, // Включаем HTTPS (уже включено через basicSsl, но для ясности)
  },
});