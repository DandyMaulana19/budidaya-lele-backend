import { getNotifications } from "../controllers/notification.controller.js";

export default async function notificationRoutes(app) {
    app.get(
        "/notifications",
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            return getNotifications(request, reply);
        }
    );
}
