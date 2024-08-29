const fs = require("fs").promises;
const userService = require("./userService");

async function syncDataToDB() {
  try {
    const data = await fs.readFile("./data/userStates.json", "utf8");
    const userStates = JSON.parse(data).sessions;

    for (const user of userStates) {
      const { id, username, firstName, lastName, email, data } = user;
      const { counter, correctAnswers, totalQuestions } = data;

      const dbData = JSON.stringify(data);
      const userExists = await userService.getUserStateByUserId(id);

      if (userExists) {
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
    await fs.writeFile(
      "./data/userStates.json",
      JSON.stringify({ sessions: [] }, null, 2),
      "utf8"
    );
  } catch (error) {
    console.error("Ошибка при синхронизации данных:", error);
  }
}

module.exports = {
  syncDataToDB,
};
