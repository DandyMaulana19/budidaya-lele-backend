import { z } from "zod";

export const fileSchema = z.object({
  filename: z
    .string({ required_error: "Image file is required" })
    .nonempty("Image File is requied"),

  mimetype: z.enum(
    ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"],
    { message: "Invalid file type. Allowed types: jpg, jpeg, heic" }
  ),
});

export const updateFileSchema = fileSchema.partial();
