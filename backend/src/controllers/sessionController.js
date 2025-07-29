const Session = require('../models/Session');
const Message = require('../models/Message');
const Component = require('../models/Component');

// @desc    Get all user sessions
// @route   GET /api/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    let query = { user: req.user.id, isActive: true };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sessions = await Session.find(query)
      .sort({ 'metadata.lastActivity': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('messageCount')
      .lean();

    const total = await Session.countDocuments(query);

    res.status(200).json({
      success: true,
      data: sessions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
const getSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    }).populate('messageCount');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update last activity
    await session.updateActivity();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new session
// @route   POST /api/sessions
// @access  Private
const createSession = async (req, res, next) => {
  try {
    const sessionData = {
      ...req.body,
      user: req.user.id
    };

    const session = await Session.create(sessionData);

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session
// @route   PUT /api/sessions/:id
// @access  Private
const updateSession = async (req, res, next) => {
  try {
    let session = await Session.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (key === 'currentComponent') {
        session.currentComponent = { ...session.currentComponent, ...req.body[key] };
      } else if (key === 'settings') {
        session.settings = { ...session.settings, ...req.body[key] };
      } else if (key === 'metadata') {
        session.metadata = { ...session.metadata, ...req.body[key] };
      } else {
        session[key] = req.body[key];
      }
    });

    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete session (soft delete)
// @route   DELETE /api/sessions/:id
// @access  Private
const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.isActive = false;
    await session.save();

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get session messages
// @route   GET /api/sessions/:id/messages
// @access  Private
const getSessionMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const messages = await Message.find({ session: req.params.id })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name avatar')
      .lean();

    const total = await Message.countDocuments({ session: req.params.id });

    res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent sessions
// @route   GET /api/sessions/recent
// @access  Private
const getRecentSessions = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const sessions = await Session.findRecent(req.user.id, parseInt(limit));

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate session
// @route   POST /api/sessions/:id/duplicate
// @access  Private
const duplicateSession = async (req, res, next) => {
  try {
    const originalSession = await Session.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!originalSession) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Create new session with copied data
    const newSessionData = {
      title: `${originalSession.title} (Copy)`,
      description: originalSession.description,
      currentComponent: originalSession.currentComponent,
      settings: originalSession.settings,
      user: req.user.id,
      metadata: {
        ...originalSession.metadata,
        totalMessages: 0,
        lastActivity: new Date()
      }
    };

    const newSession = await Session.create(newSessionData);

    res.status(201).json({
      success: true,
      data: newSession
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
  getSessionMessages,
  getRecentSessions,
  duplicateSession
};
