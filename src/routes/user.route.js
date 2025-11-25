import { changePassword } from "../controllers/user.controller.js";

export default function UserRoutes(app) {
  app.post(
    "/change-password",
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return changePassword(request, reply);
    }
  );
}
