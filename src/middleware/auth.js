export const authenticate = async (req, reply, done) => {
  if (!req.headers.authorization) {
    reply.code(401).send({ error: "Unauthorized" });
  } else {
    done();
  }
};
