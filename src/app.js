const express = require('express');
const app = express();
const cors = require('cors');

const userRoutes = require('./routes/user.routes');
const questionRoutes = require('./routes/question.routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
// Mount router với tiền tố "/user"
app.use('/user', userRoutes);
app.use('/question', questionRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
