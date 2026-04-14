const router = require('express').Router()
const {likes} = require('../controller/')

router.post('/likes',likes)


module.exports = router ;