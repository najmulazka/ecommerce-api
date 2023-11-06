const router = require('express').Router();
const { inputProduct, products, detailProducts } = require('../controllers/products.controllers');
const { image } = require('../libs/multer');

router.post('/', image.single('productPicture'), inputProduct);
router.get('/', products);
router.get('/:productId', detailProducts);

module.exports = router;
