import express from 'express';
import { handleChatbotMessage } from '../controllers/chatbotController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, handleChatbotMessage);

export default router;
