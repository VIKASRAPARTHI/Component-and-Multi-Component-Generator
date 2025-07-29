const express = require('express');
const {
  generateComponent,
  addMessage,
  getMessage,
  updateMessage,
  deleteMessage,
  getAvailableModels
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const { validate, chatSchemas } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Chat routes
router.get('/models', getAvailableModels);
router.post('/generate', validate(chatSchemas.generate), generateComponent);
router.post('/message', validate(chatSchemas.message), addMessage);

router.route('/messages/:id')
  .get(getMessage)
  .put(updateMessage)
  .delete(deleteMessage);

module.exports = router;
