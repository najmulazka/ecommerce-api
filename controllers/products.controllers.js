const prisma = require('../libs/prisma');
const imagekit = require('../libs/imagekit');
const path = require('path');
const { getPagination } = require('../libs/pagination');

module.exports = {
  // Feature input product
  inputProduct: async (req, res, next) => {
    try {
      let { nama_produk, deskripsi, harga, stok, nama_kategori } = req.body;
      if (!nama_produk) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing nama produk', data: null });
      }
      if (!harga) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing harga', data: null });
      }
      if (!stok) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing stok', data: null });
      }
      if (!req.file) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing file', data: null });
      }

      let strFile = req.file.buffer.toString('base64');
      const { url, fileId } = await imagekit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
      });

      const category = await prisma.categorys.upsert({
        where: { nama_kategori },
        create: {
          nama_kategori,
        },
        update: {
          nama_kategori,
        },
      });

      const product = await prisma.products.create({
        data: {
          nama_produk,
          product_picture: url,
          fileId: fileId,
          deskripsi,
          harga: Number(harga),
          stok: Number(stok),
          categoriId: category.id,
          userId: req.users.id,
        },
      });

      if (!product) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: null, data: null });
      }

      return res.status(201).json({
        status: true,
        message: 'Created!',
        err: null,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  },

  // Feature show products
  products: async (req, res, next) => {
    try {
      let { limit = 10, page = 1 } = req.query;
      limit = Number(limit);
      page = Number(page);

      const products = await prisma.products.findMany({
        skip: (page - 1) * limit,
        take: limit,
      });

      const { _count } = await prisma.products.aggregate({
        _count: { id: true },
      });

      let pagination = getPagination(req, _count.id, limit, page);

      return res.status(200).json({
        status: true,
        message: 'OK!',
        err: null,
        data: { pagination, products },
      });
    } catch (err) {
      next(err);
    }
  },
};
