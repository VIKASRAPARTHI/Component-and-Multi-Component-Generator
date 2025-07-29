const Session = require('../models/Session');
const Message = require('../models/Message');
const Component = require('../models/Component');
const aiService = require('../services/aiService');

// @desc    Generate component from chat message
// @route   POST /api/chat/generate
// @access  Private
const generateComponent = async (req, res, next) => {
  try {
    const { sessionId, message, images, model = 'gpt-4o-mini', temperature = 0.7 } = req.body;

    let session;

    // If no sessionId provided, create a new session
    if (!sessionId) {
      session = await Session.create({
        user: req.user.id,
        title: `Session ${new Date().toLocaleDateString()}`,
        description: 'Auto-created session'
      });
    } else {
      // Verify session belongs to user
      session = await Session.findOne({
        _id: sessionId,
        user: req.user.id,
        isActive: true
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
    }

    // Create user message
    const userMessage = await Message.create({
      session: session._id,
      user: req.user.id,
      role: 'user',
      content: {
        text: message,
        images: images || []
      }
    });

    // Create assistant message with pending status
    const assistantMessage = await Message.create({
      session: session._id,
      user: req.user.id,
      role: 'assistant',
      content: {
        text: '',
        code: {
          jsx: '',
          css: '',
          props: {}
        }
      },
      metadata: {
        model,
        temperature
      },
      status: 'processing'
    });

    // Update session message count
    await session.incrementMessageCount();

    // Send immediate response with message IDs
    res.status(200).json({
      success: true,
      data: {
        session: session,
        userMessage,
        assistantMessage: {
          ...assistantMessage.toObject(),
          status: 'processing'
        }
      }
    });

    // Process AI generation asynchronously
    try {
      const startTime = Date.now();

      // Get conversation context
      const context = await Message.getConversationContext(session._id, 10);

      // Generate component using AI service
      const aiResponse = await aiService.generateComponent({
        message,
        images,
        context,
        model,
        temperature,
        currentComponent: session.currentComponent
      });

      const processingTime = Date.now() - startTime;

      // Update assistant message with generated content
      assistantMessage.content = {
        text: aiResponse.explanation || 'Component generated successfully',
        code: {
          jsx: aiResponse.jsx || '',
          css: aiResponse.css || '',
          props: aiResponse.props || {}
        }
      };

      assistantMessage.metadata.tokens = aiResponse.tokens;
      assistantMessage.metadata.processingTime = processingTime;
      assistantMessage.status = 'completed';

      await assistantMessage.save();

      // Update session with new component
      session.currentComponent = {
        jsx: aiResponse.jsx || session.currentComponent.jsx,
        css: aiResponse.css || session.currentComponent.css,
        props: { ...session.currentComponent.props, ...(aiResponse.props || {}) }
      };

      session.metadata.aiModel = model;
      await session.save();

      // Create/update component record
      if (aiResponse.jsx) {
        await Component.findOneAndUpdate(
          { session: session._id },
          {
            session: session._id,
            user: req.user.id,
            name: aiResponse.componentName || `Component ${Date.now()}`,
            description: aiResponse.explanation || '',
            code: {
              jsx: aiResponse.jsx,
              css: aiResponse.css || '',
              props: aiResponse.props || {},
              dependencies: aiResponse.dependencies || []
            },
            metadata: {
              aiModel: model,
              generationPrompt: message,
              category: aiResponse.category || 'other',
              complexity: aiResponse.complexity || 'simple'
            }
          },
          { upsert: true, new: true }
        );
      }

    } catch (aiError) {
      console.error('AI Generation Error:', aiError);

      // Update assistant message with error
      assistantMessage.status = 'failed';
      assistantMessage.error = {
        message: 'Failed to generate component',
        code: 'AI_GENERATION_ERROR',
        details: aiError.message
      };
      assistantMessage.content.text = 'Sorry, I encountered an error while generating the component. Please try again.';

      await assistantMessage.save();
    }

  } catch (error) {
    next(error);
  }
};

// @desc    Add message to session
// @route   POST /api/chat/message
// @access  Private
const addMessage = async (req, res, next) => {
  try {
    const { sessionId, content, role = 'user' } = req.body;

    // Verify session belongs to user
    const session = await Session.findOne({
      _id: sessionId,
      user: req.user.id,
      isActive: true
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    const message = await Message.create({
      session: sessionId,
      user: req.user.id,
      role,
      content
    });

    // Update session activity
    await session.incrementMessageCount();

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get message by ID
// @route   GET /api/chat/messages/:id
// @access  Private
const getMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('session', 'title user')
      .populate('user', 'name avatar');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has access to this message
    if (message.session.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this message'
      });
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update message
// @route   PUT /api/chat/messages/:id
// @access  Private
const updateMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('session', 'user');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has access to this message
    if (message.session.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this message'
      });
    }

    // Only allow updating user messages
    if (message.role !== 'user') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit user messages'
      });
    }

    // Mark as edited and update content
    if (req.body.content && req.body.content.text) {
      await message.markAsEdited(req.body.content.text);
    }

    res.status(200).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/chat/messages/:id
// @access  Private
const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('session', 'user');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user has access to this message
    if (message.session.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available AI models
// @route   GET /api/chat/models
// @access  Private
const getAvailableModels = async (req, res, next) => {
  try {
    const models = aiService.getAvailableModels();

    res.status(200).json({
      success: true,
      data: models
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateComponent,
  addMessage,
  getMessage,
  updateMessage,
  deleteMessage,
  getAvailableModels
};
