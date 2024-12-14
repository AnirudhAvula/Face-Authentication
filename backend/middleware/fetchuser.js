const jwt = require('jsonwebtoken');
const JWT_SECRET = "ShhhKeepthisasecret";

const fetchuser = (req, res, next) => {
  // Get user from JWT token and add id to req object
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({ error: "No token provided! Please authenticate using a valid token!" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    // Ensure `user` is attached to `req.user` with the id
    if (!data.user || !data.user.id) {
      return res.status(401).send({ error: "Invalid token structure. No user data found." });
    }
    req.user = data.user;  // Attach the user data to req.user
    next();
  } catch (error) {
    console.error("Error in token verification:", error);
    res.status(401).send({ error: "Unauthorized: Please authenticate yourself." });
  }
};

module.exports = fetchuser;
