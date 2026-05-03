import jwt from "jsonwebtoken";
const SECRETKEY=process.env.APP_SECRET_KEY;


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;


  if (!authHeader) {
    return res.status(401).json({ message: "No token" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRETKEY);
    req.user = decoded;
    next();
  } catch {

      return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;