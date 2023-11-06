const prisma = require('../libs/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET_KEY } = process.env;

module.exports = {
  // Feature Register
  register: async (req, res, next) => {
    try {
      let { fullName, email, password, passwordConfirmation } = req.body;
      if (!fullName || !email || !password || !passwordConfirmation) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing full name or email or password', data: null });
      }

      if (password != passwordConfirmation) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'please ensure that the password and password confirmation match!', data: null });
      }

      const userExist = await prisma.users.findUnique({ where: { email } });
      if (userExist) {
        return res.status(400).json({ status: false, message: 'Bad Request', err: 'email has already been used!', data: null });
      }

      const encriptedPassword = await bcrypt.hash(password, 10);
      const result = await prisma.$transaction(async (prisma) => {
        const users = await prisma.users.create({ data: { email, password: encriptedPassword } });
        const profiles = await prisma.profiles.create({ data: { userId: users.id, fullName } });

        return { users, profiles };
      });

      return res.status(201).json({
        status: false,
        message: 'Created!',
        err: null,
        data: {
          users: {
            id: result.users.id,
            email: result.users.email,
            profiles: {
              id: result.profiles.id,
              fullName: result.profiles.fullName,
              userId: result.profiles.userId,
            },
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Feature Login
  login: async (req, res, next) => {
    try {
      let { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing email or password', data: null });
      }
      const userExist = await prisma.users.findUnique({
        where: { email },
        include: {
          profiles: {
            select: {
              fullName: true,
              address: true,
              phoneNumber: true,
              profilePicture: true,
              fileId: true,
            },
          },
        },
      });
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
        data: {
          users: {
            id: userExist.id,
            email: userExist.email,
            googleid: userExist.googleid,
            profiles: {
              fullName: userExist.profiles.fullName,
              address: userExist.profiles.address,
              phoneNumber: userExist.profiles.phoneNumber,
              profilePicture: userExist.profiles.profilePicture,
              fileIdy: userExist.profiles.fileIdy,
            },
          },
          token,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // Feature Login With Account Google
  googleOauth2: async (req, res) => {
    let token = jwt.sign({ id: req.user.id }, JWT_SECRET_KEY);
    const profiles = await prisma.profiles.findUnique({ where: { userId: req.user.id } });

    return res.status(200).json({
      status: true,
      message: 'OK',
      err: null,
      data: {
        users: {
          id: req.user.id,
          email: req.user.email,
          profiles: {
            fullName: profiles.fullName,
            address: profiles.address,
            phoneNumber: profiles.phoneNumber,
            profilePicture: profiles.profilePicture,
            fileId: profiles.fileId,
          },
        },
        token,
      },
    });
  },
};
