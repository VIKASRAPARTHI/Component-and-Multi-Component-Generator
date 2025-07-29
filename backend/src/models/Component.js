const mongoose = require('mongoose');

const componentSchema = new mongoose.Schema({
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
  name: {
    type: String,
    required: [true, 'Component name is required'],
    trim: true,
    maxlength: [100, 'Component name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  code: {
    jsx: {
      type: String,
      required: [true, 'JSX code is required']
    },
    css: {
      type: String,
      default: ''
    },
    props: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    dependencies: [{
      name: String,
      version: String,
      type: {
        type: String,
        enum: ['dependency', 'devDependency', 'peerDependency'],
        default: 'dependency'
      }
    }]
  },
  metadata: {
    version: {
      type: Number,
      default: 1
    },
    category: {
      type: String,
      enum: ['button', 'form', 'layout', 'navigation', 'display', 'input', 'feedback', 'other'],
      default: 'other'
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    complexity: {
      type: String,
      enum: ['simple', 'medium', 'complex'],
      default: 'simple'
    },
    framework: {
      type: String,
      default: 'react'
    },
    aiModel: {
      type: String,
      default: 'gpt-4o-mini'
    },
    generationPrompt: {
      type: String,
      maxlength: [2000, 'Generation prompt cannot exceed 2000 characters']
    }
  },
  preview: {
    thumbnail: String, // Base64 or URL to thumbnail image
    screenshots: [String], // Array of screenshot URLs
    livePreviewUrl: String
  },
  usage: {
    downloads: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    forks: {
      type: Number,
      default: 0
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentComponent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Component',
    default: null
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
componentSchema.index({ session: 1, createdAt: -1 });
componentSchema.index({ user: 1, createdAt: -1 });
componentSchema.index({ 'metadata.category': 1 });
componentSchema.index({ 'metadata.tags': 1 });
componentSchema.index({ isPublic: 1, isActive: 1 });
componentSchema.index({ name: 'text', description: 'text' });

// Virtual for version history
componentSchema.virtual('versions', {
  ref: 'Component',
  localField: '_id',
  foreignField: 'parentComponent'
});

// Pre-save middleware to increment version if this is an update
componentSchema.pre('save', function(next) {
  if (this.isModified('code') && !this.isNew) {
    this.metadata.version += 1;
  }
  next();
});

// Instance method to increment usage stats
componentSchema.methods.incrementDownloads = function() {
  this.usage.downloads += 1;
  return this.save({ validateBeforeSave: false });
};

componentSchema.methods.incrementViews = function() {
  this.usage.views += 1;
  return this.save({ validateBeforeSave: false });
};

componentSchema.methods.incrementLikes = function() {
  this.usage.likes += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to create a new version
componentSchema.methods.createVersion = function(updates) {
  const newComponent = new this.constructor({
    ...this.toObject(),
    _id: undefined,
    parentComponent: this._id,
    metadata: {
      ...this.metadata,
      version: this.metadata.version + 1
    },
    usage: {
      downloads: 0,
      views: 0,
      likes: 0,
      forks: 0
    },
    createdAt: undefined,
    updatedAt: undefined,
    ...updates
  });
  
  return newComponent.save();
};

// Static method to find user components
componentSchema.statics.findUserComponents = function(userId, options = {}) {
  const query = { user: userId, isActive: true };
  
  if (options.category) {
    query['metadata.category'] = options.category;
  }
  
  if (options.tags && options.tags.length > 0) {
    query['metadata.tags'] = { $in: options.tags };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 50)
    .populate('session', 'title');
};

// Static method to find public components
componentSchema.statics.findPublicComponents = function(options = {}) {
  const query = { isPublic: true, isActive: true };
  
  if (options.category) {
    query['metadata.category'] = options.category;
  }
  
  if (options.search) {
    query.$text = { $search: options.search };
  }
  
  return this.find(query)
    .sort({ 'usage.likes': -1, createdAt: -1 })
    .limit(options.limit || 20)
    .populate('user', 'name avatar');
};

module.exports = mongoose.model('Component', componentSchema);
