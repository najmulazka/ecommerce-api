const prisma = require('../libs/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  register: async (req, res, next) => {
    try {
      let { name, email, password, password_confirmation } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing name or email or password', data: null });
      }

      if (password != password_confirmation) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'please ensure that the password and password confirmation match!', data: null });
      }

      const userExist = await prisma.users.findUnique({ where: { email } });
      if (userExist) {
        return res.status(400).json({ status: false, message: 'Bad Request', err: 'email has already been used!', data: null });
      }

      const encriptedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.users.create({
        data: {
          name,
          email,
          password: encriptedPassword,
        },
      });

      const profile = await prisma.profiles.create({
        data: {
          userId: user.id,
        },
      });

      return res.status(201).json({
        status: false,
        message: 'Created!',
        err: null,
        data: {
          user: { id: user.id, name: user.name, email: user.email },
          profile: { id: profile.id, userId: profile.userId },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  googleOauth2: (req, res) => {
    let token = jwt.sign({ id: req.user.id }, JWT_SECRET_KEY);

    return res.status(200).json({
      status: true,
      message: 'OK',
      err: null,
      data: { user: { id: req.user.id, name: req.user.name, email: req.user.email }, token },
    });
  },
};
