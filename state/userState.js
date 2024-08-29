const fs = require("fs").promises;
const path = require("path");
const moment = require("moment");

const stateFilePath = path.join(__dirname, "../data/userStates.json");

// Функция для форматирования даты
const formatDate = (date) => moment(date).format("YYYY-MM-DD_HH:mm:ss");

module.exports = async (ctx, isCorrectAnswer = false, userInfo = null) => {
  try {
    const userId = ctx.from?.id?.toString() || "unknown";
    const username = ctx.from?.username || null;
    const firstName = ctx.from?.first_name || null;
    const lastName = ctx.from?.last_name || null;
    const languageCode = ctx.from?.language_code || null;
    const phoneNumber = ctx.message?.contact?.phone_number || null;

    console.log("User ID:", userId);

    let userStates = { sessions: [] };

    // Загрузка существующих данных
    try {
      const userStatesData = await fs.readFile(stateFilePath, "utf8");
      userStates = JSON.parse(userStatesData);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error("Ошибка при чтении или парсинге userStates.json:", err);
      }
    }

    // Поиск сессии пользователя или создание новой
    let userSession = userStates.sessions.find(
      (session) => session.id === userId
    );
    if (!userSession) {
      userSession = {
        id: userId,
        username: username,
        firstName: firstName,
        lastName: lastName,
        languageCode: languageCode,
        phoneNumber: phoneNumber,
        name: null,
        email: null,
        data: {
          counter: 0,
          correctAnswers: 0,
          totalQuestions: 0,
        },
      };
      userStates.sessions.push(userSession);
    } else {
      // Обновляем существующую сессию пользователя
      userSession.username = username;
      userSession.firstName = firstName;
      userSession.lastName = lastName;
      userSession.languageCode = languageCode;
      userSession.phoneNumber = phoneNumber;
    }

    // Если предоставлены данные пользователя, обновляем имя и email
    if (userInfo) {
      userSession.name = userInfo.name || userSession.name;
      userSession.email = userInfo.email || userSession.email;
    }

    // Определяем текущий counter
    const currentCounter = userSession.data.counter;

    // Если новая сессия, увеличиваем counter и создаем новый блок данных
    if (ctx.session.questionIndex === 0 || !userSession.data[currentCounter]) {
      userSession.data.counter += 1;
      userSession.data[userSession.data.counter] = {
        correctAnswers: 0,
        totalQuestions: 0,
        startDate: formatDate(new Date()), // Дата начала сессии, отформатированная
        endDate: null, // Пока не завершена
      };
    }

    // Используем обновленный currentCounterString
    const currentCounterString = userSession.data.counter.toString();

    // Обновление статистики текущей сессии
    if (isCorrectAnswer !== null) {
      userSession.data[currentCounterString].totalQuestions += 1;
      if (isCorrectAnswer) {
        userSession.data[currentCounterString].correctAnswers += 1;
      }

      // Устанавливаем дату завершения, если викторина завершена
      if (
        ctx.session.questionIndex &&
        ctx.session.questionIndex >= (ctx.session.totalQuestions || 0)
      ) {
        userSession.data[currentCounterString].endDate = formatDate(new Date()); // Дата завершения, отформатированная
      }

      // Обновление общей статистики
      userSession.data.totalQuestions += 1;
      if (isCorrectAnswer) {
        userSession.data.correctAnswers += 1;
      }
    }

    // Запись обновленных данных в файл
    await fs.writeFile(
      stateFilePath,
      JSON.stringify(userStates, null, 2),
      "utf8"
    );

    // Логи с форматированными датами
    console.log(`User ID: ${userId}`);
    console.log(`Username: ${username}`);
    console.log(`First Name: ${firstName}`);
    console.log(`Last Name: ${lastName}`);
    console.log(`Language Code: ${languageCode}`);
    console.log(`Phone Number: ${phoneNumber}`);
    console.log(`Name: ${userSession.name}`);
    console.log(`Email: ${userSession.email}`);
    console.log(
      `Session ${currentCounterString}: Start Date: ${userSession.data[currentCounterString].startDate}`
    );
    console.log(
      `Session ${currentCounterString}: End Date: ${
        userSession.data[currentCounterString].endDate
          ? userSession.data[currentCounterString].endDate
          : "Not finished yet"
      }`
    );
    console.log(
      `Session ${currentCounterString}: Correct Answers: ${userSession.data[currentCounterString].correctAnswers}`
    );
    console.log(
      `Session ${currentCounterString}: Total Questions: ${userSession.data[currentCounterString].totalQuestions}`
    );
    console.log(`Overall Correct Answers: ${userSession.data.correctAnswers}`);
    console.log(`Overall Total Questions: ${userSession.data.totalQuestions}`);

    return userSession.data.counter;
  } catch (error) {
    console.error("Произошла ошибка:", error);
    throw error; // Повторно выбрасываем ошибку для обработки вызывающей стороной
  }
};
