import { z } from "zod";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "../database/schema/index.js";

const loginSchema = z.object({
  username: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
});

export const loginController = async (request, reply) => {
  const db = request.server.db;
  const validation = loginSchema.safeParse(request.body);

  if (!validation.success) {
    return reply
      .status(400)
      .send({ error: "Invalid input", details: validation.error.format() });
  }

  const { username, password } = validation.data;

  try {
    const user = await db.select().from(users);
    if (!user) {
      return reply.status(401).send({ error: "Invalid username or password" });
    }

    // adapt field name if your DB stores the hashed password under a different key
    const passwordHash = user.passwordHash || user.password;
    const matches = await bcrypt.compare(password, passwordHash);
    if (!matches) {
      return reply.status(401).send({ error: "Invalid username or password" });
    }

    // Optionally issue a JWT if you have fastify-jwt registered:
    // const token = await reply.jwtSign({ sub: user.id, username: user.username });
    // return reply.send({ message: "Login successful", token });

    return reply.send({ message: "Login successful" });
  } catch (err) {
    // log error on server side and return generic message
    request.log?.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const registerController = async (request, reply) => {};
