const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "15m", 
    });
};
const generateRefreshToken = (user) => {
    return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d", 
    });
};

module.exports = { generateToken, generateRefreshToken };
