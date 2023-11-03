const router = require('express').Router();
const { inputProduct} = require('../controllers/products.controllers');
const { image } = require('../libs/multer');

router.post('/', image.single('product_picture'), inputProduct);

module.exports = router;