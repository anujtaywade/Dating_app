const router = require('express').Router()

const {sendMessage , getMessages} = require('../controller/chatController')
const {protect} = require('../middleware/authMiddleware')
const {profileCompleteCheck} = require('../middleware/profileMiddleware')

router.post('/chat/:matchId/send')
router.get('/chat/:matchId')