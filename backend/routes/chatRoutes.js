const express=require('express');
const {createOrGetConversationController,sendMessageController,getMessagesController,getConversationsController} = require('../controllers/messageController');
const authenticateUser = require("../middleware/authMiddleware");

const router = express.Router();





router.post('/conversation',authenticateUser ,createOrGetConversationController);  // POST /api/chat/conversation - get or create conversation if none exist
router.post('/message',authenticateUser ,sendMessageController);  // POST /api/chat/message - send a message

router.get('/messages/:conversationId',authenticateUser, getMessagesController);  // POST /api/chat/messages - get messages for specific conversation
router.get('/conversations',authenticateUser ,getConversationsController);  // POST /api/chat/conversations - get all conversations for specific user


module.exports =router;
