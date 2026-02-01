import { registerDevice, unregisterDevice } from "../controllers/device.controller.js";

export default async function deviceRoutes(app) {
    app.post(
        "/device/register",
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            return registerDevice(request, reply);
        }
    );

    app.post(
        "/device/unregister",
        { preHandler: [app.authenticate] },
        async (request, reply) => {
            return unregisterDevice(request, reply);
        }
    );
}
