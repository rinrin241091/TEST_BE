const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
  res.send("Server is running! 🚀");
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
