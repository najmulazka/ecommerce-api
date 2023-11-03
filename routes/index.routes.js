const router = require('express').Router();
const auth = require('./auth.routes');
const profiles = require('./profiles.routes');
const products = require('./products.routes');
const { restrinct } = require('../middlewares/restrinct.middlewares');

router.use('/auth', auth);
router.use('/profiles', restrinct, profiles);
router.use('/products', restrinct, products);

module.exports = router;
