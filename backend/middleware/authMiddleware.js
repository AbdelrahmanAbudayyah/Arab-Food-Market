const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    const token = req.cookies.accessToken;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user data to request
        next(); // Continue to the next middleware or route handler
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
};

module.exports = authenticateUser;
