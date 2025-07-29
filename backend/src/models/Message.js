const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    text: {
      type: String,
      required: function() {
        return this.role === 'user' || this.role === 'system';
      }
    },
    images: [{
      url: String,
      alt: String,
      size: Number
    }],
    code: {
      jsx: String,
      css: String,
      props: mongoose.Schema.Types.Mixed
    }
  },
  metadata: {
    model: {
      type: String,
      default: 'gpt-4o-mini'
    },
    tokens: {
      prompt: Number,
      completion: Number,
      total: Number
    },
    processingTime: {
      type: Number, // in milliseconds
      default: 0
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  error: {
    message: String,
    code: String,
    details: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
messageSchema.index({ session: 1, createdAt: 1 });
messageSchema.index({ user: 1, createdAt: -1 });
messageSchema.index({ role: 1 });
messageSchema.index({ status: 1 });

// Pre-save middleware to validate content based on role
messageSchema.pre('save', function(next) {
  if (this.role === 'assistant' && !this.content.text && (!this.content.code || !this.content.code.jsx)) {
    return next(new Error('Assistant messages must have either text or code content'));
  }

  if (this.role === 'user' && !this.content.text && (!this.content.images || this.content.images.length === 0)) {
    return next(new Error('User messages must have either text or image content'));
  }
  
  next();
});

// Instance method to mark as edited
messageSchema.methods.markAsEdited = function(newContent) {
  if (this.content.text) {
    this.metadata.editHistory.push({
      content: this.content.text,
      editedAt: new Date()
    });
  }
  
  this.content.text = newContent;
  this.metadata.isEdited = true;
  
  return this.save();
};

// Instance method to update processing status
messageSchema.methods.updateStatus = function(status, error = null) {
  this.status = status;
  if (error) {
    this.error = error;
  }
  return this.save({ validateBeforeSave: false });
};

// Static method to find session messages
messageSchema.statics.findSessionMessages = function(sessionId, options = {}) {
  const query = { session: sessionId };
  
  return this.find(query)
    .sort({ createdAt: options.reverse ? -1 : 1 })
    .limit(options.limit || 100)
    .populate('user', 'name avatar');
};

// Static method to find latest assistant message in session
messageSchema.statics.findLatestAssistantMessage = function(sessionId) {
  return this.findOne({
    session: sessionId,
    role: 'assistant',
    status: 'completed'
  }).sort({ createdAt: -1 });
};

// Static method to get conversation context
messageSchema.statics.getConversationContext = function(sessionId, limit = 10) {
  return this.find({
    session: sessionId,
    status: 'completed'
  })
  .sort({ createdAt: -1 })
  .limit(limit)
  .select('role content.text content.code createdAt')
  .lean();
};

module.exports = mongoose.model('Message', messageSchema);
