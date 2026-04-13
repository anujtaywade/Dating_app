const router = require('express').Router()
const {completeProfile} = require('../controller/profileCompleteController.js')
const {protect} = require ('../middleware/authMiddleware.js')

router.put('/profile',protect, completeProfile)

module.exports = router ;