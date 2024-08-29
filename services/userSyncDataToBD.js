const fs = require("fs").promises;
const userService = require("./userService"); // Подключение к сервисам пользователя

async function syncDataToDB() {
  try {
    const data = await fs.readFile("./data/userStates.json", "utf8");
    const userStates = JSON.parse(data).sessions;

    for (const user of userStates) {
      const { id, username, firstName, lastName, email, data } = user;
      const { counter, correctAnswers, totalQuestions } = data;

      // Подготовка данных для записи в базу
      const dbData = JSON.stringify(data);

      // Проверка на существование пользователя в базе данных
      const userExists = await userService.getUserStateByUserId(id);

      if (userExists) {
        // Обновление данных пользователя
        await userService.updateUserState(
          id,
          username,
          firstName,
          lastName,
          email,
          counter,
          correctAnswers,
          totalQuestions,
          dbData
        );
      } else {
        // Вставка новых данных пользователя
        await userService.createUserState(
          id,
          username,
          firstName,
          lastName,
          email,
          counter,
          correctAnswers,
          totalQuestions,
          dbData
        );
      }
    }

    console.log("Данные успешно синхронизированы с базой данных.");

    // Очищаем JSON после успешной синхронизации
    await fs.writeFile(
      "./data/userStates.json",
      JSON.stringify({ sessions: [] }, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Ошибка при синхронизации данных:", error);
  }
}

// Вызов функции для синхронизации данных
syncDataToDB();
