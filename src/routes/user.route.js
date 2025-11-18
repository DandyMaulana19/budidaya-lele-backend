import { changePassword } from "../controllers/user.controller";

export default function UserRoutes(app) {
  app.post("/api/user/change-password", async (request, reply) => {
    return changePassword(request, reply);
  });
}
