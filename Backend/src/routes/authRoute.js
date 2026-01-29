const router = require('express').Router()


router.post('/login',login)
router.post('/signup',signup)
router.post('/logout',logout)

module.exports = router