const { Telegraf } = require("telegraf");
const config = require("./config/config");
const startStopCommands = require("./commands/startStopCommands");
const quizActions = require("./actions/quizActions");
const sessionMiddleware = require("./middleware/sessionMiddleware");
const { syncQuestions } = require("./services/questionService");
const { syncDataToDB } = require("./services/userSyncDataToBD"); // Импорт функции

// Импорт cron-задач
require("./utils/cronJobs");

// Остальной код вашего бота
const bot = new Telegraf(config.botToken);

// Настройка сессий
bot.use(sessionMiddleware);

// Обработка команд
startStopCommands(bot);

quizActions(bot);

// Синхронизация вопросов из базы данных с локальным файлом
syncQuestions();

// Глобальный обработчик ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}`, err);
});

// Запуск бота
async function startBot() {
  try {
    // Синхронизация данных с базой данных перед запуском бота
    await syncDataToDB();

    await bot.launch();
    console.log("Бот запущен...");
  } catch (err) {
    console.error("Ошибка при запуске бота:", err);
  }
}

startBot();
