import { errorCodes } from "fastify";

export const verifyToken = (req, reply, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(201).json({ error: "Token invalid" });

  const token = authHeader.split("")[1];

  try {
    const decoded = jwt.verify();
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(201).json({ error: "Token invalid" });
  }
};
