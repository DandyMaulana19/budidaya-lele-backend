import {
  logoutController,
  loginController,
} from "../controllers/auth.controller.js";

export default function authRoutes(app) {
  app.post("/login", async (request, reply) => {
    return loginController(request, reply);
  });
  app.post(
    "/logout",
    { preHandler: app.authenticate },
    async (request, reply) => {
      return logoutController(request, reply);
    }
  );
}
