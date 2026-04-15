const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware');
const { profileCompleteCheck } = require('../middleware/profileMiddleware');
const {sendLike ,getRequests} = require('../controller/likeController')

router.post('/sendLikes/:userId',protect,profileCompleteCheck,sendLike)
router.get('/likes/requests',protect,profileCompleteCheck, getRequests)


module.exports = router ;