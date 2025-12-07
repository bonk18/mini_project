require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { authRouter } = require('./routes/auth');
const shiftsRoute = require('./routes/shifts');  // Import the shifts route
const adminRoute = require('./routes/admin');

const app = express();
const port = process.env.PORT || 5000;

// Connect to database
connectDB();

app.use(cors());
app.use(express.json());  // To parse JSON bodies

// Routes
app.use('/api/auth', authRouter);  // Auth routes
app.use('/api/shifts', shiftsRoute);  // Shifts routes
app.use('/api/admin', adminRoute);  // Admin routes


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});