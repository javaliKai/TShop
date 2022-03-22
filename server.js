const cors = require('cors');
const express = require('express');
const app = express();
const connectDB = require('./config/db');

// Connect to mongo DB
connectDB();

// Handle CORS
app.use(cors());

// Body parser middleware
app.use(express.json());

// Define api routes
app.get('/', (req, res) => {
  res.send('API is running');
});

app.use('/api/users', require('./api/routes/users'));
app.use('/api/auth', require('./api/routes/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
