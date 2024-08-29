const cron = require("node-cron");
const { syncDataToDB } = require("../services/userSyncDataToBD");

// Запуск задачи синхронизации каждые 5 минут
cron.schedule("*/5 * * * *", () => {
  console.log("Выполняется задача синхронизации данных...");
  syncDataToDB();
});
