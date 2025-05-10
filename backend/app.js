require('dotenv').config();
const jwt = require("jsonwebtoken");

const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const { generateToken} = require("./utils/jwt")

const app = express();
app.use(cookieParser());

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(cors({
    origin: 'http://localhost:3000', // your frontend prod domain
    credentials: true
  }));
  


app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/foodItems', require('./routes/foodItemsRoutes'));

app.use('/api/orders', require('./routes/ordersRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

app.post("/api/refresh-token", (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log("im inside refresh token route");
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const newAccessToken = generateToken({ id: decoded.id });
        console.log("newAccessToken:",newAccessToken);


        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
});

app.post("/api/logout", (req, res) => {
    console.log("clearing cookies after logging out")
    res.clearCookie('accessToken', { httpOnly: true, sameSite: 'strict', secure: false });
     res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: false });
    res.status(200).json({ message: 'Logged out successfully' });
});

// testing 
if(process.env.NODE_ENV=== 'test'){
app.use('/api/test', require('./routes/e2etesting'));
}



module.exports = app; 
