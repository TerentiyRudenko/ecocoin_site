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

  console.log(`Received /start from telegram_id: ${telegramId}`);

  try {
    // Проверяем наличие one_time_code для telegram_id
    const { data, error } = await supabase
      .from('users_login_test')
      .select('one_time_code')
      .eq('telegram_id', telegramId)
      .single();

    if (error) {
      console.error('Supabase select error:', error);
      bot.sendMessage(chatId, 'An error occurred. Please try again later.');
      return;
    }

    if (!data || !data.one_time_code) {
      bot.sendMessage(chatId, 'You currently have no verification code.');
      console.log(`No one_time_code found for telegram_id: ${telegramId}`);
    } else {
      bot.sendMessage(chatId, 'Please enter your verification code.');
      console.log(`Found one_time_code: ${data.one_time_code} for telegram_id: ${telegramId}`);

      // Устанавливаем обработчик следующего сообщения
      bot.once('message', async function handler(response) {
        const enteredCode = response.text.trim().toUpperCase();
        console.log(`User entered code: ${enteredCode} for telegram_id: ${telegramId}`);

        try {
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

          if (!userData || !userData.one_time_code) {
            console.error(`No one_time_code found during verification for telegram_id: ${telegramId}`);
            bot.sendMessage(chatId, 'Your verification code has expired. Please generate a new one.');
            return;
          }

          if (userData.one_time_code === enteredCode) {
            // Код правильный: обновляем isverifiedforcurrentcode и очищаем one_time_code
            console.log(`Code verified successfully for telegram_id: ${telegramId}`);
            const { data: updatedData, error: updateError } = await supabase
              .from('users_login_test')
              .update({
                one_time_code: null,
                isverifiedforcurrentcode: true,
              })
              .eq('telegram_id', telegramId)
              .select();

            if (updateError) {
              console.error('Supabase update error:', updateError);
              bot.sendMessage(chatId, 'An error occurred. Please try again later.');
            } else {
              console.log(`Updated record for telegram_id: ${telegramId}`, updatedData);
              bot.sendMessage(chatId, 'Verification successful!');

              // Через 5 секунд сбрасываем isverifiedforcurrentcode в false
              setTimeout(async () => {
                try {
                  const { data: resetData, error: resetError } = await supabase
                    .from('users_login_test')
                    .update({
                      isverifiedforcurrentcode: false,
                    })
                    .eq('telegram_id', telegramId)
                    .select();

                  if (resetError) {
                    console.error('Supabase reset error:', resetError);
                  } else {
                    console.log(`Reset isverifiedforcurrentcode to false for telegram_id: ${telegramId}`, resetData);
                  }
                } catch (err) {
                  console.error('Unexpected error during reset:', err);
                }
              }, 5000); // 5 секунд
            }
          } else {
            // Код неверный: повторяем запрос
            console.log(`Incorrect code entered for telegram_id: ${telegramId}`);
            bot.sendMessage(chatId, 'Incorrect code. Please try again.');
            bot.once('message', handler);
          }
        } catch (err) {
          console.error('Unexpected error during code verification:', err);
          bot.sendMessage(chatId, 'An error occurred. Please try again later.');
        }
      });
    }
  } catch (err) {
    console.error('Unexpected error in /start handler:', err);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
});

// Обработчик ошибок polling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Bot is running...');