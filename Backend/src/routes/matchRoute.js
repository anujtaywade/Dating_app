const router = require('express').Router()

const { getMatches , unmatch} = require('../controller/matchController')
const { completeProfile } = require('../controller/profileCompleteController')
const { protect } = require('../middleware/authMiddleware')

router.get('/',protect,completeProfile,getMatches)
router.delete('/:id',protect,completeProfile,unmatch)

module.exports = router