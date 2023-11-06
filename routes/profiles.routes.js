const router = require('express').Router();
const { updateProfile, detailProfile } = require('../controllers/profiles.controllers');
const { image } = require('../libs/multer');

router.get('/', detailProfile);
router.put('/', image.single('profilePicture'), updateProfile);

module.exports = router;
