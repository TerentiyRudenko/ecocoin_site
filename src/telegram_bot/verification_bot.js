import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';

// Настройка Supabase
const supabaseUrl = 'https://nffhqgtgwazclqshtjzj.supabase.co'; // Замените на ваш URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZmhxZ3Rnd2F6Y2xxc2h0anpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYxMTgyNCwiZXhwIjoyMDU5MTg3ODI0fQ.Mlfek6R_vpRcDRlI69f7xLtqbhvqxaH-Zg4b6y4lvHc'; // Замените на ваш ключ
const supabase = createClient(supabaseUrl, supabaseKey);

// Настройка Telegram-бота
const token = '7629902349:AAHsKdOidQXCchCAEf0VKfRswfCaiX-bMgY'; // Замените на токен от @BotFather
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    // Проверяем наличие one_time_code для telegram_id
    const { data, error } = await supabase
      .from('users_login_test')
      .select('one_time_code')
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      bot.sendMessage(chatId, 'An error occurred. Please try again later.');
      return;
    }

    if (!data || !data.one_time_code) {
      bot.sendMessage(chatId, 'You currently have no verification code.');
    } else {
      bot.sendMessage(chatId, 'Please enter your verification code.');
      // Устанавливаем обработчик следующего сообщения
      bot.once('message', async function handler(response) {
        const enteredCode = response.text.trim().toUpperCase();

        // Проверяем код
        const { data: userData, error: fetchError } = await supabase
          .from('users_login_test')
          .select('one_time_code')
          .eq('telegram_id', telegramId)
          .single();

        if (fetchError) {
          console.error('Supabase fetch error:', fetchError);
          bot.sendMessage(chatId, 'An error occurred. Please try again later.');
          return;
        }

        if (userData.one_time_code === enteredCode) {
          // Код правильный: обновляем isVerifiedForCurrentCode и очищаем one_time_code
          const { error: updateError } = await supabase
            .from('users_login_test')
            .update({
              one_time_code: null,
              isVerifiedForCurrentCode: true,
            })
            .eq('telegram_id', telegramId);

          if (updateError) {
            console.error('Supabase update error:', updateError);
            bot.sendMessage(chatId, 'An error occurred. Please try again later.');
          } else {
            bot.sendMessage(chatId, 'Verification successful!');
          }
        } else {
          // Код неверный: повторяем запрос
          bot.sendMessage(chatId, 'Incorrect code. Please try again.');
          bot.once('message', handler); // Рекурсивно вызываем тот же обработчик
        }
      });
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
});

// Обработчик ошибок polling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Bot is running...');