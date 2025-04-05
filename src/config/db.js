const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/users.json");

const getUsers = () => {
  const data = fs.readFileSync(dbPath);
  return JSON.parse(data);
};

const saveUsers = (users) => {
  fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
};

module.exports = { getUsers, saveUsers };
