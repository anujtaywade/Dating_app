const router = require('express').Router()

const {getDiscoverUsers} = require('../controller/discoverController')
const {protect} = require('../middleware/authMiddleware')
const {profileCompleteCheck } = require('../middleware/profileMiddleware')

router.get('/discover',getDiscoverUsers, profileCompleteCheck , protect)

module.exports = router