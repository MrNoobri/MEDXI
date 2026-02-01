const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const { authenticate } = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authenticate);

// Send message
router.post("/", messageController.sendMessage);

// Get conversations
router.get("/conversations", messageController.getConversations);

// Get unread count
router.get("/unread-count", messageController.getUnreadCount);

// Get messages with specific user
router.get("/:userId", messageController.getMessages);

// Delete message
router.delete("/:id", messageController.deleteMessage);

module.exports = router;
