const prisma = require('../libs/prisma');
const imagekit = require('../libs/imagekit');
const path = require('path');

module.exports = {
  // Feature Detail Profile
  detailProfile: async (req, res, next) => {
    try {
      const profileExist = await prisma.users.findUnique({
        where: { id: req.users.id },
        select: {
          id: true,
          email: true,
          googleId: true,
          profiles: {
            select: {
              id: true,
              fullName: true,
              address: true,
              phoneNumber: true,
              profilePicture: true,
              fileId: true,
              userId: true,
            },
          },
        },
      });

      return res.status(200).json({
        status: true,
        message: 'OK!',
        err: null,
        data: profileExist,
      });
    } catch (err) {
      next(err);
    }
  },

  // Feature Update Profile
  updateProfile: async (req, res, next) => {
    try {
      let { fullName, address, phoneNumber } = req.body;
      if (!req.file) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing file', data: null });
      }

      let strFile = req.file.buffer.toString('base64');

      const { url, fileId } = await imagekit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
      });

      const profiles = await prisma.profiles.upsert({
        where: { userId: req.users.id },
        create: {
          userId: req.users.id,
          fullName,
          address,
          phoneNumber,
          profilePicture: url,
          fileId,
        },
        update: {
          fullName,
          address,
          phoneNumber,
          profilePicture: url,
          fileId,
        },
      });

      if (!profiles) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: null, data: null });
      }

      return res.status(200).json({
        status: true,
        message: 'OK!',
        err: null,
        data: {
          users: {
            id: req.users.id,
            email: req.users.email,
            googleId: req.users.googleId,
            profiles,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
