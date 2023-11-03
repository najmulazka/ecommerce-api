const prisma = require('../libs/prisma');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  restrinct: (req, res, next) => {
    let { authorization } = req.headers;
    const token = authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: false,
        message: 'Unauthorized',
        err: 'Missing token on header',
        data: null,
      });
    }

    jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message: 'Unauthorized',
          err: err.message,
          data: null,
        });
      }

      req.users = await prisma.users.findUnique({ where: { id: decoded.id } });
      req.profiles = await prisma.profiles.findUnique({ where: { userId: decoded.id } });
      next();
    });
  },
};
