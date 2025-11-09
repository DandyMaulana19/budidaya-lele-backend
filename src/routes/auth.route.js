import {
  registerController,
  loginController,
} from "../controllers/auth.controller.js";

export default function authRoutes(app) {
  app.post("/api/register", async (request, reply) => {
    return registerController(request, reply);
  });

  app.post("/api/login", async (request, reply) => {
    return loginController(request, reply);
  });
}
