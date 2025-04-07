require("dotenv").config();
const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET_KEY;

module.exports.generateToken = async (payload) => {
  const accessToken = jwt.sign(payload, secretKey, { expiresIn: "1d" });
  const refreshToken = jwt.sign(payload, secretKey, { expiresIn: "7d" });
  return { accessToken, refreshToken };
};

module.exports.verifyToken = async (token) => {
  const decoded = jwt.verify(token, secretKey);
  return decoded;
};
