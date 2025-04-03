import { Telegraf } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

// Настройка Supabase
const supabaseUrl = 'https://nffhqgtgwazclqshtjzj.supabase.co'; // Ваш URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mZmhxZ3Rnd2F6Y2xxc2h0anpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzYxMTgyNCwiZXhwIjoyMDU5MTg3ODI0fQ.Mlfek6R_vpRcDRlI69f7xLtqbhvqxaH-Zg4b6y4lvHc'; // Ваш Anon Key
const supabase = createClient(supabaseUrl, supabaseKey);

// Проверка подключения к Supabase
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('test').select('*').limit(1); // Изменили на 'test'
    console.log('Supabase test:', { data, error });
  } catch (err) {
    console.error('Supabase connection test failed:', err);
  }
}
testSupabaseConnection();

// Настройка бота
const bot = new Telegraf('8181188505:AAHxlZkVev7HYiMiJ7scyDLBt8jhqQ8Ib9U');

bot.command('start', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const username = ctx.from.username || 'No username';
    console.log('User data:', { id: userId, username: username });

    const { data, error } = await supabase
      .from('test') // Изменили на 'test'
      .upsert(
        { tg_id: userId, tg_username: username },
        { onConflict: 'tg_id' }
      );

    if (error) {
      console.error('Supabase error details:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Data saved to Supabase:', data);
    await ctx.reply(`Authentication successful! Your EcoCoin profile: https://ecocoin.top/tgID=${userId}`);
  } catch (err) {
    console.error('Full error in /start:', JSON.stringify(err, null, 2));
    await ctx.reply('Authentication failed. Please try again.');
  }
});

bot.launch().then(() => {
  console.log('Bot started');
}).catch((err) => {
  console.error('Bot failed to start:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));