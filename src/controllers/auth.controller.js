import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { users } from "../database/schema/index.js";
import { loginSchema } from "../validations/auth.validation.js";
import { errorResponse, successResponse } from "../utils/response.js";

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
    const user = await db.select().from(users).where(eq(users.email, email));

    if (!user || user.length === 0) {
      return errorResponse(reply, "Invalid username or password", 401);
    }

    const existingPassword = user[0].password;
    const matches = await bcrypt.compare(password, existingPassword);

    if (!matches) {
      return errorResponse(reply, "Invalid username or password", 401);
    }

    const type = "Bearer";

    const payload = {
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      role: user[0].role,
    };
    const token = request.server.jwt.sign(payload, {
      expiresIn: "1h",
    });

    const expires_at = new Date(Date.now() * 1000).toLocaleString("sv-SE", {
      timeZone: "Asia/Jakarta",
    });

    return successResponse(
      reply,
      "Login successful",
      { expires_at, token, type },
      200
    );
  } catch (err) {
    request.log?.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};
