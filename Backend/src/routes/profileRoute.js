const router = require('express').Router()
const {completeProfile} = require('../controller/profileCompleteController')

router.put('/profile',completeProfile)

module.exports = router ;