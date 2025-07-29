const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Session title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    default: function() {
      return `Session ${new Date().toLocaleDateString()}`;
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  currentComponent: {
    jsx: {
      type: String,
      default: ''
    },
    css: {
      type: String,
      default: ''
    },
    props: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  metadata: {
    totalMessages: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    aiModel: {
      type: String,
      default: 'gpt-4o-mini'
    },
    tags: [{
      type: String,
      trim: true
    }],
    isPublic: {
      type: Boolean,
      default: false
    }
  },
  settings: {
    autoSave: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
sessionSchema.index({ user: 1, createdAt: -1 });
sessionSchema.index({ 'metadata.lastActivity': -1 });
sessionSchema.index({ 'metadata.tags': 1 });
sessionSchema.index({ isActive: 1 });

// Virtual for message count (will be populated from Message model)
sessionSchema.virtual('messageCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'session',
  count: true
});

// Pre-save middleware to update lastActivity
sessionSchema.pre('save', function(next) {
  if (this.isModified() && !this.isModified('metadata.lastActivity')) {
    this.metadata.lastActivity = new Date();
  }
  next();
});

// Instance method to update activity
sessionSchema.methods.updateActivity = function() {
  this.metadata.lastActivity = new Date();
  return this.save({ validateBeforeSave: false });
};

// Instance method to increment message count
sessionSchema.methods.incrementMessageCount = function() {
  this.metadata.totalMessages += 1;
  this.metadata.lastActivity = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find user's active sessions
sessionSchema.statics.findUserSessions = function(userId, options = {}) {
  const query = { user: userId, isActive: true };
  
  return this.find(query)
    .sort({ 'metadata.lastActivity': -1 })
    .limit(options.limit || 50)
    .populate('user', 'name email avatar');
};

// Static method to find recent sessions
sessionSchema.statics.findRecent = function(userId, limit = 10) {
  return this.find({ user: userId, isActive: true })
    .sort({ 'metadata.lastActivity': -1 })
    .limit(limit)
    .select('title description metadata.lastActivity metadata.totalMessages');
};

module.exports = mongoose.model('Session', sessionSchema);
