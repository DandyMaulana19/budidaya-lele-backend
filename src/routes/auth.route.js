import { loginController } from "../controllers/auth.controller.js";

export default function authRoutes(app) {
  app.post("/login", async (request, reply) => {
    return loginController(request, reply);
  });
}
