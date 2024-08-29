const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const connection = require("./database");

const questionsFilePath = path.join(__dirname, "questions.js");
const hashFilePath = path.join(__dirname, "questions_hash.txt");

// Функция для получения вопросов из базы данных
const getQuestionsFromDatabase = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM quiz_questions";
    connection.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }

      // Преобразование options из строки в массив
      const formattedResults = results.map((question) => ({
        ...question,
        options:
          typeof question.options === "string"
            ? JSON.parse(question.options)
            : question.options,
      }));

      resolve(formattedResults);
    });
  });
};

// Функция для вычисления хеша от данных
const computeHash = (data) => {
  return crypto.createHash("sha256").update(data).digest("hex");
};

// Функция для загрузки текущего хеша из файла
const loadCurrentHash = () => {
  if (fs.existsSync(hashFilePath)) {
    return fs.readFileSync(hashFilePath, "utf8");
  }
  return null;
};

// Функция для сохранения нового хеша в файл
const saveCurrentHash = (hash) => {
  fs.writeFileSync(hashFilePath, hash, "utf8");
};

// Функция для сохранения вопросов в локальный файл
const saveQuestionsToFile = (questions) => {
  const data = `module.exports = ${JSON.stringify(questions, null, 2)};`;
  fs.writeFileSync(questionsFilePath, data, "utf8");
};

// Функция для синхронизации вопросов с проверкой изменений
const syncQuestions = async () => {
  try {
    const questions = await getQuestionsFromDatabase();
    const newQuestionsData = JSON.stringify(questions);
    const newHash = computeHash(newQuestionsData);

    const currentHash = loadCurrentHash();

    if (newHash !== currentHash) {
      saveQuestionsToFile(questions);
      saveCurrentHash(newHash);
      console.log(
        "Вопросы были изменены и успешно синхронизированы с базой данных."
      );
    } else {
      console.log("Вопросы не изменились, используется кэш.");
    }
  } catch (err) {
    console.error("Ошибка при синхронизации вопросов:", err);
  }
};

module.exports = {
  syncQuestions,
  getQuestionsFromDatabase,
};
