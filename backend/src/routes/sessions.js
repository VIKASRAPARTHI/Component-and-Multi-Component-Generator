const express = require('express');
const {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  getSessionMessages,
  getRecentSessions,
  duplicateSession
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');
const { validate, sessionSchemas } = require('../middleware/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// Session routes
router.route('/')
  .get(getSessions)
  .post(validate(sessionSchemas.create), createSession);

router.get('/recent', getRecentSessions);

router.route('/:id')
  .get(getSession)
  .put(validate(sessionSchemas.update), updateSession)
  .delete(deleteSession);

router.get('/:id/messages', getSessionMessages);
router.post('/:id/duplicate', duplicateSession);

module.exports = router;
