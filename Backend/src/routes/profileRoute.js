const router = require('express').Router()
const {completeProfile} = require('../controller/profileController')

router.post('/profile',completeProfile)

module.exports = router ;