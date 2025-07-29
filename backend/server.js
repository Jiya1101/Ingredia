require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('./utils/errorHandler');

const authController = require('./controllers/authController');
const protect = require('./middleware/jwtMiddleware');

const connectDB = require('./config/db');
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(bodyParser.json());

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Ingredia Backend Healthy'
    })
});

app.post('/api/auth/google', authController.googleLogin);
app.get('/api/protected-data', protect, (req, res) => {

    res.status(200).json({
        message: 'You successfully accessed a JWT-protected route!',
        user: req.user
    });
});

app.use(errorHandler);

app.listen(PORT,() => {
    console.log(`Ingredia Backend server running on http://localhost:${PORT}`)
    console.log(`Access health check at http://localhost:${PORT}/health`);
    console.log(`Google Login endpoint: POST http://localhost:${PORT}/api/auth/google`);
    console.log(`Protected Data endpoint: GET http://localhost:${PORT}/api/protected-data (requires your custom JWT)`);
});

module.exports = app;


