import { users } from "../database/schema/users.schema.js";
import { changePasswordSchema } from "../validations/user.validation.js";
import { errorResponse, successResponse } from "../utils/response.js";
import bcrypt from "bcrypt";

export const changePassword = async (request, reply) => {
  const db = request.server?.db;
  const { id } = request.user;

  const validation = changePasswordSchema.safeParse(request.body);
  if (!validation.success)
    return errorResponse(reply, validation.error.errors[0].message, null, 400);

  const { oldPassword, newPassword } = validation.data;
  try {
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user || user.length === 0) {
      return errorResponse(reply, "User not found", null, 404);
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user[0].password);
    if (!isPasswordValid) {
      return errorResponse(reply, "Invalid old password", null, 401);
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
