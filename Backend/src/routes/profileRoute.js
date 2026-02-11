const router = require('express').Router()
const {completeProfile} = require('../controller/profileCompleteController')

router.post('/profile',completeProfile)

module.exports = router ;