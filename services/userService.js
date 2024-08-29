//userService.js
const connection = require("./database");

// Функция для получения состояния пользователя по user_id
const getUserStateByUserId = (userId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user_states WHERE user_id = ?";
    connection.query(query, [userId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results[0]); // Вернуть первый найденный результат или undefined
    });
  });
};

// Функция для обновления счетчика для существующего пользователя
const incrementCounter = (userId) => {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE user_states SET counter = counter + 1 WHERE user_id = ?";
    connection.query(query, [userId], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

// Функция для обновления состояния пользователя
const updateUserState = (
  userId,
  username,
  firstName,
  lastName,
  email,
  counter,
  correctAnswers,
  totalQuestions,
  data
) => {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE user_states SET username = ?, first_name = ?, last_name = ?, email = ?, counter = ?, correct_answers = ?, total_questions = ?, data = ? WHERE user_id = ?";
    connection.query(
      query,
      [
        username,
        firstName,
        lastName,
        email,
        counter,
        correctAnswers,
        totalQuestions,
        data,
        userId,
      ],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};

// Функция для создания нового состояния пользователя
const createUserState = (userId, username, firstName, lastName, email) => {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO user_states (user_id, username, first_name, last_name, email, counter) VALUES (?, ?, ?, ?, ?, 1)";
    connection.query(
      query,
      [userId, username, firstName, lastName, email],
      (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      }
    );
  });
};

module.exports = {
  getUserStateByUserId,
  incrementCounter,
  createUserState,
  updateUserState,
};
