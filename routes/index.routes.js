const router = require('express').Router();
const auth = require('./auth.routes');
const profiles = require('./profiles.routes');
const { restrinct } = require('../middlewares/restrinct.middlewares');
router.use('/auth', auth);
router.use('/profiles', restrinct, profiles);

module.exports = router;
