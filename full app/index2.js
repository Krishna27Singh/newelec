const express = require('express');
const app = express();
const homeRoute = require('./routes/homeRoute.js');

app.set('view engine', 'ejs');
app.use('/auth/google/callback', homeRoute);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});