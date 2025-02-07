const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const Middleware = async (req, res, next) => {
  try {
    const token = req.headers["auth-token"];
    if (!token) {
      return res.status(404).send("Access Denied. No token Found!");
    }
    const parsedData = await jwt.verify(token, JWT_SECRET);
    if (parsedData) {
      req.userToken = parsedData.id;
    }
    next();
  } catch {
    return res.status(500).send("Internal Server Error in Middleware!");
  }
};
module.exports = Middleware;
