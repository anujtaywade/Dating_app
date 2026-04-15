const router = require('express').Router()
const { protect } = require('../middleware/authMiddleware');
const { profileCompleteCheck } = require('../middleware/profileMiddleware');
const {sendLike ,getRequests, acceptLike , rejectLike} = require('../controller/likeController')

router.post('/sendLikes/:userId',protect,profileCompleteCheck,sendLike)
router.get('/likes/requests',protect,profileCompleteCheck, getRequests)
router.post('/likes/accept/:id',protect , profileCompleteCheck, acceptLike)
router.post('/likes/reject/:id',protect , profileCompleteCheck, rejectLike)


module.exports = router ;