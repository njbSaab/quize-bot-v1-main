const mysql = require("mysql2");
require("dotenv").config(); // Подгрузка конфигурации из .env файла

// Настройка подключения к базе данных
const connection = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err);
    return;
  }
  console.log("Подключение к базе данных установлено");

  // Запрос для получения всех вопросов из базы данных
  connection.query("SELECT * FROM quiz_questions", (err, questionsResults) => {
    if (err) {
      console.error("Ошибка при получении вопросов:", err);
    } else {
      console.log("Вопросы из базы данных:");
      console.log(questionsResults);
    }

    // Запрос для получения всех пользователей из базы данных
    connection.query("SELECT * FROM user_states", (err, usersResults) => {
      if (err) {
        console.error("Ошибка при получении пользователей:", err);
      } else {
        console.log("Пользователи из базы данных:");
        console.log(usersResults);
      }

      // Закрытие соединения с базой данных
      connection.end((err) => {
        if (err) {
          console.error("Ошибка при закрытии соединения с базой данных:", err);
        } else {
          console.log("Соединение с базой данных закрыто");
        }
      });
    });
  });
});
