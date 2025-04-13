// // server.js
// import { createServer } from 'vite';
// import express from 'express';
// import { Telegraf } from 'telegraf';
// import { createClient } from '@supabase/supabase-js';
// import cors from 'cors';

// // Настройка Supabase
// const supabaseUrl = 'https://nffhqgtgwazclqshtjzj.supabase.co';
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZmhxZ3Rnd2F6Y2xxc2h0anpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYxMTgyNCwiZXhwIjoyMDU5MTg3ODI0fQ.Mlfek6R_vpRcDRlI69f7xLtqbhvqxaH-Zg4b6y4lvHc';
// const supabase = createClient(supabaseUrl, supabaseKey);

// // Настройка Telegram-бота
// const bot = new Telegraf('8181188505:AAHxlZkVev7HYiMiJ7scyDLBt8jhqQ8Ib9U');

// // Настройка Express
// const app = express();
// app.use(express.json());
// app.use(cors({
//   origin: 'https://localhost:5173',
//   methods: ['GET', 'POST'],
//   credentials: true,
// }));

// // Эндпоинт для идентификации пользователя по deviceId
// app.post('/identify-user', async (req, res) => {
//   try {
//     const { deviceId } = req.body;

//     if (!deviceId) {
//       console.error('deviceId is missing in request body');
//       return res.status(400).json({ error: 'deviceId is required' });
//     }

//     console.log('Received deviceId:', deviceId);

//     const { data, error } = await supabase
//       .from('test')
//       .select('*')
//       .eq('device_id', deviceId)
//       .single();

//     if (error && error.code !== 'PGRST116') {
//       console.error('Supabase error:', error);
//       throw error;
//     }

//     if (data) {
//       console.log('Found existing deviceId in database:', data);
//       return res.json({ deviceId: data.device_id, userData: data });
//     } else {
//       console.log('deviceId not found, creating new record');
//       const { data: newData, error: insertError } = await supabase
//         .from('test')
//         .insert({ device_id: deviceId })
//         .select()
//         .single();

//       if (insertError) {
//         console.error('Insert error:', insertError);
//         throw insertError;
//       }

//       console.log('New record created:', newData);
//       return res.json({ deviceId: newData.device_id, userData: newData });
//     }
//   } catch (err) {
//     console.error('Error in /identify-user:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Эндпоинт для обработки /start-command
// app.post('/start-command', async (req, res) => {
//   try {
//     const { userId, deviceId } = req.body;

//     if (!deviceId) {
//       return res.status(400).json({ error: 'deviceId is required' });
//     }

//     console.log('Processing /start-command with:', { userId: userId || 'pending', deviceId });

//     const { data, error } = await supabase
//       .from('test')
//       .upsert(
//         { device_id: deviceId, ...(userId && userId !== 'pending' && { tg_id: userId }) },
//         { onConflict: 'device_id' }
//       );

//     if (error) {
//       console.error('Supabase upsert error:', error);
//       throw error;
//     }

//     console.log('Data saved to Supabase:', data);

//     if (userId && userId !== 'pending') {
//       await bot.telegram.sendMessage(userId, `Ваш deviceId: ${deviceId} успешно обработан через HTTPS-запрос.`);
//     }

//     res.json({ message: 'Запрос обработан успешно, ожидайте авторизации в Telegram' });
//   } catch (err) {
//     console.error('Error in /start-command:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Эндпоинт /auth-callback (для обратного вызова от бота)
// app.post('/auth-callback', async (req, res) => {
//   try {
//     const { tg_id: userId, deviceId } = req.body;

//     if (!userId || !deviceId) {
//       return res.status(400).json({ error: 'userId and deviceId are required' });
//     }

//     console.log('Received auth callback:', { userId, deviceId });

//     // Обновляем данные в Supabase
//     const { data, error } = await supabase
//       .from('test')
//       .upsert(
//         { tg_id: userId, device_id: deviceId },
//         { onConflict: 'device_id' }
//       );

//     if (error) {
//       console.error('Supabase upsert error:', error);
//       throw error;
//     }

//     console.log('Auth callback processed, data saved:', data);
//     res.json({ message: 'Auth callback processed successfully' });
//   } catch (err) {
//     console.error('Error in /auth-callback:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Обработка команды /start в Telegram
// bot.command('start', async (ctx) => {
//   try {
//     const userId = ctx.from.id;
//     const username = ctx.from.username || 'No username';
//     console.log('User data:', { id: userId, username: username });

//     const { data, error } = await supabase
//       .from('test')
//       .upsert(
//         { tg_id: userId, tg_username: username },
//         { onConflict: 'tg_id' }
//       );

//     if (error) {
//       console.error('Supabase upsert error:', error);
//       throw error;
//     }

//     console.log('Data saved to Supabase:', data);

//     const deviceId = ctx.message.text.split(' ')[1];
//     console.log('Extracted deviceId:', deviceId);

//     if (deviceId) {
//       console.log('Sending request to /auth-callback with:', { tg_id: userId, deviceId });
//       const response = await fetch('https://localhost:5173/auth-callback', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ tg_id: userId, deviceId }),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error('Failed to notify site about auth:', response.status, errorText);
//         throw new Error('Failed to notify site about auth');
//       }

//       console.log('Successfully notified site about auth');
//     } else {
//       console.warn('No deviceId provided in /start command');
//     }

//     await ctx.reply('Авторизация успешна! Перейдите по ссылке: https://localhost:5173');
//   } catch (err) {
//     console.error('Error in /start:', err);
//     await ctx.reply('Authentication failed. Please try again.');
//   }
// });

// // Запуск Vite с кастомным сервером
// (async () => {
//   const vite = await createServer({
//     server: {
//       middlewareMode: true,
//     },
//     appType: 'custom',
//   });

//   // Интегрируем Express с Vite
//   app.use(vite.middlewares);

//   const PORT = 5173; // Используем тот же порт, что и Vite
//   app.listen(PORT, () => {
//     console.log(`Server running on https://localhost:${PORT}`);

//     // Запускаем polling для Telegram-бота
//     bot.launch();
//     console.log('Bot polling started');
//   });

//   // Останавливаем polling при завершении процесса
//   process.once('SIGINT', () => {
//     bot.stop('SIGINT');
//     vite.close();
//   });
//   process.once('SIGTERM', () => {
//     bot.stop('SIGTERM');
//     vite.close();
//   });
// })();