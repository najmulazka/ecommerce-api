const prisma = require('../libs/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  // Fitur registrasi
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
      const result = await prisma.$transaction(async (prisma) => {
        const user = await prisma.users.create({ data: { name, email, password: encriptedPassword } });
        const profile = await prisma.profiles.create({ data: { userId: user.id } });

        return { user, profile };
      });

      return res.status(201).json({
        status: false,
        message: 'Created!',
        err: null,
        data: {
          user: { id: result.user.id, name: result.user.name, email: result.user.email },
          profile: { id: result.profile.id, userId: result.profile.userId },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Fitur login
  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing email or password', data: null });
      }
      const userExist = await prisma.users.findUnique({ where: { email } });
      if (!userExist) {
        return res.status(400).json({ status: false, message: 'Bad Request', err: 'Email or password vailed', data: null });
      }

      const match = await bcrypt.compare(password, userExist.password);
      if (!match) {
        return res.status(400).json({ status: false, message: 'Bad Request', err: 'Email or password vailed', data: null });
      }

      let token = jwt.sign({ id: userExist.id }, JWT_SECRET_KEY);

      return res.status(200).json({
        status: false,
        message: 'OK',
        err: null,
        data: { user: { name: userExist.name, email: userExist.email }, token },
      });
    } catch (err) {
      next(err);
    }
  },

  // Fitur login menggunakan akun google
  googleOauth2: (req, res) => {
    let token = jwt.sign({ id: req.user.id }, JWT_SECRET_KEY);

    return res.status(200).json({
      status: true,
      message: 'OK',
      err: null,
      data: {
        user: { id: req.user.id, name: req.user.name, email: req.user.email },
        token,
      },
    });
  },
};
