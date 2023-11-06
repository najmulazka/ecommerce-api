const prisma = require('../libs/prisma');
const imagekit = require('../libs/imagekit');
const path = require('path');
const { getPagination } = require('../libs/pagination');

module.exports = {
  // Feature input product
  inputProduct: async (req, res, next) => {
    try {
      let { productName, description, price, stock, categoryName } = req.body;
      if (!productName) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing product name', data: null });
      }
      if (!price) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing price', data: null });
      }
      if (!stock) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing stock', data: null });
      }
      if (!req.file) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: 'Missing file', data: null });
      }

      let strFile = req.file.buffer.toString('base64');
      const { url, fileId } = await imagekit.upload({
        fileName: Date.now() + path.extname(req.file.originalname),
        file: strFile,
      });

      // const category = await prisma.categorys.upsert({
      //   where: { categoryName },
      //   create: {
      //     categoryName,
      //   },
      //   update: {
      //     categoryName,
      //   },
      // });

      // const products = await prisma.products.create({
      //   data: {
      //     productName,
      //     description,
      //     price: Number(price),
      //     stock: Number(stock),
      //     productPicture: url,
      //     fileId: fileId,
      //     userId: req.users.id,
      //     categoryId: category.id,
      //   },
      // });

      const products = await prisma.products.create({
        data: {
          productName,
          description,
          price: Number(price),
          stock: Number(stock),
          productPicture: url,
          fileId: fileId,
          userId: req.users.id,
          categories: {
            create: [
              {
                categorys: {
                  connectOrCreate: {
                    where: {
                      categoryName,
                    },
                    create: {
                      categoryName,
                    },
                  },
                },
              },
            ],
          },
        },
      });

      const categories = await prisma.CategoriesOnProducts.findMany({
        where: {
          productId: products.id,
        },
        select: {
          categoryId: true,
        },
      });

      if (!products) {
        return res.status(400).json({ status: false, message: 'Bad Request!', err: null, data: null });
      }

      return res.status(201).json({
        status: true,
        message: 'Created!',
        err: null,
        data: { products, categories },
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
        include: {
          categories: {
            select: {
              categoryId: true,
            },
          },
        },
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
