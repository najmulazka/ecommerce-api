const prisma = require('../libs/prisma');
const imagekit = require('../libs/imagekit');
const path = require('path');

module.exports = {
  // Fitur update profile
  updateProfile: async (req, res, next) => {
    try {
      let { nama_lengkap, alamat, nomor_telepon } = req.body;
      if (!req.file) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing file', data: null });
      }

      let strFile = req.file.buffer.toString('base64');

      const { url, fileId } = await imagekit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
      });

      const profile = await prisma.profiles.upsert({
        where: { userId: req.users.id },
        create: {
          userId: req.users.id,
          nama_lengkap,
          alamat,
          nomor_telepon,
          profile_picture: url,
          fileId,
        },
        update: {
          nama_lengkap,
          alamat,
          nomor_telepon,
          profile_picture: url,
          fileId,
        },
      });

      if (!profile) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: null, data: null });
      }

      return res.status(200).json({
        status: true,
        message: 'OK!',
        err: null,
        data: { profiles: profile },
      });
    } catch (err) {
      next(err);
    }
  },
};
