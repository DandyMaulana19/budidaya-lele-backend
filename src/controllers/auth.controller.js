import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "../database/schema/index.js";
import { loginSchema } from "../validations/auth.validation.js";
import { errorResponse, successResponse } from "../helper/response.js";

export const loginController = async (request, reply) => {
  const db = request.server.db;
  const validation = loginSchema.safeParse(request.body);

  if (!validation.success) {
    return reply
      .status(400)
      .send({ error: "Invalid input", details: validation.error.issues });
  }

  const { email, password } = validation.data;

  try {
    const now = new Date()
      .toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" })
      .replace(" ", "T");

    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user || user.length === 0) {
      return errorResponse(reply, "Invalid username or password", 401);
    }

    const existingPassword = user[0].password;
    const matches = await bcrypt.compare(password, existingPassword);

    if (!matches) {
      return errorResponse(reply, "Invalid username or password", 401);
    }

    const payload = { id: user[0].id, email: user[0].email };
    const token = request.server.jwt.sign(payload, { expiresIn: "1h" });
    const expired_at = now + 3600 * 1000;
    const type = "Bearer";

    return successResponse(
      reply,
      "Login successful",
      { expired_at, token, type },
      200
    );
  } catch (err) {
    request.log?.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const logoutController = async (request, reply) => {
  try {
    const auth = request.headers.authorization || request.headers.Authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return successResponse(reply, "Logout successful", {}, 200);
    }

    const token = auth.split(" ")[1];

    await request.server.jwt.verify(token);
    request.server.revokedTokens.add(token);

    return successResponse(reply, "Logout successful", {}, 200);
  } catch (err) {
    request.log?.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};
