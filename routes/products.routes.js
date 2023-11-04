const router = require('express').Router();
const { inputProduct, products } = require('../controllers/products.controllers');
const { image } = require('../libs/multer');

router.post('/', image.single('product_picture'), inputProduct);
router.get('/', products);

module.exports = router;
