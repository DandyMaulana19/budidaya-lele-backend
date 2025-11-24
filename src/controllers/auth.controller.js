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
    const expiresInSeconds = 60 * 60;

    const payload = { id: user[0].id, email: user[0].email };
    const token = request.server.jwt.sign(payload, {
      expiresIn: `${expiresInSeconds}s`,
    });

    const expired_at = new Date(
      Date.now() + expiresInSeconds * 1000
    ).toLocaleString("sv-SE", { timeZone: "Asia/Jakarta" });

    reply.setCookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: expiresInSeconds,
    });

    return successResponse(
      reply,
      "Login successful",
      { expired_at, type },
      200
    );
  } catch (err) {
    request.log?.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};

export const logoutController = async (request, reply) => {
  try {
    const headerAuth =
      request.headers.authorization || request.headers.Authorization;
    let token = undefined;

    if (request.cookies && request.cookies.token) {
      token = request.cookies.token;
    } else if (headerAuth && headerAuth.startsWith("Bearer ")) {
      token = headerAuth.split(" ")[1];
    }

    reply.clearCookie("token", { path: "/" });

    if (!token) {
      return successResponse(reply, "Logout successful", {}, 200);
    }

    try {
      await request.server.jwt.verify(token);
      request.server.revokedTokens.add(token);
    } catch (err) {
      request.log?.debug?.(err);
    }

    return successResponse(reply, "Logout successful");
  } catch (err) {
    request.log?.error(err);
    return reply.status(500).send({ error: "Internal server error" });
  }
};
