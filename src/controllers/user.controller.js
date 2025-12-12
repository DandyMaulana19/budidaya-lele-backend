import bcrypt from "bcrypt";
import { users } from "../database/schema/index.js";
import { changePasswordSchema } from "../validations/index.js";
import { errorResponse, successResponse } from "../utils/response.js";
import { eq } from "drizzle-orm";

export const changePassword = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.user;
  const body = request.body;

  const validation = changePasswordSchema.safeParse({
    oldPassword: body.oldPassword?.value,
    newPassword: body.newPassword?.value,
  });

  if (!validation.success) {
    const issues = validation.error.issues;
    const errorMessages = issues.map((issue) => issue.message);

    return errorResponse(reply, errorMessages, null, 400);
  }

  const { oldPassword, newPassword } = validation.data;
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    console.log(user);

    if (!user || user.length === 0) {
      return errorResponse(reply, "User not found", null, 404);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user[0].password);
    if (!isPasswordValid) {
      return errorResponse(reply, "Invalid old password", null, 403);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, id));

    return successResponse(reply, "Password changed successfully", null, 200);
  } catch (error) {
    return errorResponse(reply, "Internal server error", null, 500);
  }
};
