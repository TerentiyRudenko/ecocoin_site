// server.js
import express from 'express';
import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

// Инициализация Supabase
const supabase = createClient(
  'https://nffhqgtgwazclqshtjzj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3Mi...'
);

const bot = new Telegraf('8181188505:AAHxlZkVev7HYiMiJ7scyDLBt8jhqQ8Ib9U');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'https://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

// Генерация временных токенов
const authTokens = new Map();

// Инициализация аутентификации
app.post('/init-auth', async (req, res) => {
  try {
    const { userId } = req.body;
    const authToken = crypto.randomUUID();
    
    // Сохраняем токен на 5 минут
    authTokens.set(authToken, { 
      userId,
      expires: Date.now() + 300000
    });

    res.json({
      url: `https://t.me/ecocoin_login_bot?start=${authToken}`
    });
  } catch (err) {
    console.error('Init auth error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Проверка статуса аутентификации
app.get('/auth-status', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Token required' });

  const authData = authTokens.get(token);
  if (!authData) return res.json({ status: 'invalid' });

  // Проверяем привязку Telegram
  const { data } = await supabase
    .from('users')
    .select('tg_id')
    .eq('id', authData.userId)
    .single();

  res.json({
    status: data?.tg_id ? 'authenticated' : 'pending'
  });
});

// Обработка команды /start в Telegram
bot.command('start', async (ctx) => {
  try {
    const [_, token] = ctx.message.text.split(' ');
    if (!token) return ctx.reply('Неверная ссылка авторизации');

    // Связываем Telegram аккаунт
    const { data } = await supabase
      .from('users')
      .upsert({
        id: authTokens.get(token)?.userId,
        tg_id: ctx.from.id,
        tg_username: ctx.from.username
      }, { onConflict: 'id' });

    ctx.reply('✅ Авторизация прошла успешно! Вернитесь в приложение.');
  } catch (err) {
    console.error('Telegram auth error:', err);
    ctx.reply('⚠️ Ошибка авторизации');
  }
});

// Запуск сервера
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on https://localhost:${PORT}`);
  bot.launch();
});