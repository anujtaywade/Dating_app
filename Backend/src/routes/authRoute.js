const router = require('express').Router()
const {login,logout,authMe} = require('../controller/authController')
const {protect} = require('../middleware/authMiddleware')


router.post('/login',login)
router.post('/logout',logout)
router.get('/me',authMe,protect)

module.exports = router