const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware');
const { profileCompleteCheck } = require('../middleware/profileMiddleware');
const {sendLike} = require('../controller/likeController')

router.post('/sendLikes/:userId',protect,profileCompleteCheck,sendLike)


module.exports = router ;