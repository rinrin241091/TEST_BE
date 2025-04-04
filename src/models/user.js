const bcrypt = require("bcryptjs");

class User {
  static async findByEmail(email) {
    const { getUsers } = require("../config/db");
    const users = getUsers();
    return users.find((user) => user.email === email);
  }

  static async create(userData) {
    const { getUsers, saveUsers } = require("../config/db");
    const users = getUsers();

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      password: await bcrypt.hash(userData.password, 10),
    };

    users.push(newUser);
    saveUsers(users);
    return newUser;
  }
}

module.exports = User;
