const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }
    
    next();
  };
};

// Auth validation schemas
const authSchemas = {
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.min': 'Name must be at least 2 characters long',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'any.required': 'Password is required'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'Password is required'
      })
  })
};

// Session validation schemas
const sessionSchemas = {
  create: Joi.object({
    title: Joi.string()
      .min(1)
      .max(100)
      .required()
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Title is required'
      }),
    description: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      })
  }),

  update: Joi.object({
    title: Joi.string()
      .min(1)
      .max(100)
      .messages({
        'string.min': 'Title cannot be empty',
        'string.max': 'Title cannot exceed 100 characters'
      }),
    description: Joi.string()
      .max(500)
      .allow('')
      .messages({
        'string.max': 'Description cannot exceed 500 characters'
      }),
    currentComponent: Joi.object({
      jsx: Joi.string().allow(''),
      css: Joi.string().allow(''),
      props: Joi.object()
    }),
    settings: Joi.object({
      autoSave: Joi.boolean(),
      theme: Joi.string().valid('light', 'dark')
    })
  })
};

// Chat validation schemas
const chatSchemas = {
  generate: Joi.object({
    sessionId: Joi.string()
      .optional(),
    message: Joi.string()
      .min(1)
      .max(2000)
      .required()
      .messages({
        'string.min': 'Message cannot be empty',
        'string.max': 'Message cannot exceed 2000 characters',
        'any.required': 'Message is required'
      }),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri(),
        alt: Joi.string().max(200),
        size: Joi.number().positive()
      })
    ).optional(),
    model: Joi.string()
      .valid('gpt-4o-mini', 'gpt-4o', 'claude-3-sonnet', 'llama-3-8b')
      .default('gpt-4o-mini'),
    temperature: Joi.number()
      .min(0)
      .max(2)
      .default(0.7)
  }),

  message: Joi.object({
    content: Joi.object({
      text: Joi.string().max(10000),
      images: Joi.array().items(
        Joi.object({
          url: Joi.string().uri(),
          alt: Joi.string().max(200),
          size: Joi.number().positive()
        })
      ),
      code: Joi.object({
        jsx: Joi.string(),
        css: Joi.string(),
        props: Joi.object()
      })
    }).required(),
    role: Joi.string()
      .valid('user', 'assistant', 'system')
      .required()
  })
};

module.exports = {
  validate,
  authSchemas,
  sessionSchemas,
  chatSchemas
};
