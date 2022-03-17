const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Welcome to the / route');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});