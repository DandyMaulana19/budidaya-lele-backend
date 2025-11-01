import authController from "../controller/authcontroller.js";

const routes = [
  {
    method: "GET",
    url: "/login",
    handler: async (request, reply) => {
      return authController.login(request, reply);
    },
  },
];

routes.prefix = "/api";

export default routes;
