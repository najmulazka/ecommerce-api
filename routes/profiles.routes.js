const router = require('express').Router();
const { updateProfile, detailProfile } = require('../controllers/profiles.controllers');
const { image } = require('../libs/multer');

router.get('/detailProfile', detailProfile);
router.put('/', image.single('profile_picture'), updateProfile);

module.exports = router;