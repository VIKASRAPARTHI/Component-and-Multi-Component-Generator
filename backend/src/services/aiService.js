const axios = require('axios');

class AIService {
  constructor() {
    this.openRouterConfig = {
      baseURL: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
    };

    this.geminiConfig = {
      baseURL: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: process.env.GEMINI_API_KEY,
    };

    this.defaultModel = process.env.DEFAULT_MODEL || 'gpt-4o-mini';
    this.fallbackModel = process.env.FALLBACK_MODEL || 'gemini-1.5-flash';
    this.maxTokens = parseInt(process.env.MAX_TOKENS) || 4000;
    this.temperature = parseFloat(process.env.TEMPERATURE) || 0.7;
  }

  // Get available models
  getAvailableModels() {
    return {
      openrouter: [
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Fast and efficient for most tasks' },
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Most capable model for complex tasks' },
        { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast and lightweight' },
        { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'Balanced performance' },
        { id: 'llama-3.1-8b-instruct', name: 'Llama 3.1 8B', provider: 'Meta', description: 'Open source alternative' },
      ],
      gemini: [
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', description: 'Fast and efficient' },
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Most capable Gemini model' },
      ]
    };
  }

  // Get model provider
  getModelProvider(modelId) {
    const allModels = this.getAvailableModels();

    for (const provider in allModels) {
      const model = allModels[provider].find(m => m.id === modelId);
      if (model) {
        return provider === 'openrouter' ? 'openrouter' : 'gemini';
      }
    }

    return 'openrouter'; // Default
  }

  // Generate component from user prompt
  async generateComponent(options) {
    const {
      message,
      images = [],
      context = [],
      model = this.defaultModel,
      temperature = this.temperature,
      currentComponent = {}
    } = options;

    const provider = this.getModelProvider(model);

    try {
      if (provider === 'gemini') {
        return await this.generateWithGemini(message, model, {
          temperature,
          currentComponent,
          context,
          images
        });
      } else {
        return await this.generateWithOpenRouter(message, model, {
          temperature,
          currentComponent,
          context,
          images
        });
      }
    } catch (error) {
      console.error(`Primary model ${model} failed:`, error.message);

      // Try fallback model
      try {
        console.log(`Trying fallback model: ${this.fallbackModel}`);
        const fallbackProvider = this.getModelProvider(this.fallbackModel);

        if (fallbackProvider === 'gemini') {
          return await this.generateWithGemini(message, this.fallbackModel, {
            temperature,
            currentComponent,
            context,
            images
          });
        } else {
          return await this.generateWithOpenRouter(message, this.fallbackModel, {
            temperature,
            currentComponent,
            context,
            images
          });
        }
      } catch (fallbackError) {
        console.error('Fallback model also failed:', fallbackError.message);
        throw new Error('All AI models failed. Please try again later.');
      }
    }
  }

  // Generate with OpenRouter
  async generateWithOpenRouter(message, model, options = {}) {
    const {
      temperature = this.temperature,
      currentComponent = {},
      context = [],
      images = []
    } = options;

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(message, currentComponent, context);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.formatContext(context),
      { role: 'user', content: userPrompt }
    ];

    // Add images if provided
    if (images && images.length > 0) {
      const lastMessage = messages[messages.length - 1];
      lastMessage.content = [
        { type: 'text', text: userPrompt },
        ...images.map(img => ({
          type: 'image_url',
          image_url: { url: img.url }
        }))
      ];
    }

    const response = await this.callOpenRouterAI({
      model,
      messages,
      temperature,
      max_tokens: this.maxTokens
    });

    return this.parseAIResponse(response);
  }

  // Generate with Gemini
  async generateWithGemini(message, model, options = {}) {
    const {
      temperature = this.temperature,
      currentComponent = {},
      context = []
    } = options;

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(message, currentComponent, context);
    const fullPrompt = `${systemPrompt}\n\nContext: ${this.formatContextForGemini(context)}\n\nUser Request: ${userPrompt}`;

    try {
      const response = await this.callGeminiAI({
        model,
        prompt: fullPrompt,
        temperature,
        maxTokens: this.maxTokens
      });

      return this.parseGeminiResponse(response);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  // Build system prompt for component generation
  buildSystemPrompt() {
    return `You are an expert React component generator specializing in creating production-ready, accessible, and modern components. Your expertise includes React best practices, responsive design, accessibility standards, and performance optimization.

CORE PRINCIPLES:
1. Generate complete, functional React components that work out of the box
2. Use modern React patterns (functional components, hooks, proper state management)
3. Ensure full accessibility (ARIA labels, semantic HTML, keyboard navigation)
4. Create responsive designs that work on all devices and screen sizes
5. Follow React best practices and performance optimization techniques
6. Include comprehensive error handling and edge case management
7. Write clean, maintainable, and well-documented code

MANDATORY RESPONSE FORMAT (ALWAYS VALID JSON):
{
  "componentName": "PascalCaseComponentName",
  "explanation": "Detailed explanation of the component's purpose, features, and usage examples",
  "jsx": "// Complete React component code with imports, component definition, and export",
  "css": "/* Custom CSS styles when Tailwind isn't sufficient */",
  "props": {
    "propName": {
      "type": "string|number|boolean|object|array|function",
      "description": "Detailed description of the prop's purpose and usage",
      "required": true,
      "default": "defaultValue"
    }
  },
  "dependencies": ["react", "lucide-react", "other-npm-packages"],
  "category": "ui|layout|form|data|animation|navigation|feedback|utility",
  "complexity": "simple|medium|complex",
  "features": ["responsive", "accessible", "interactive", "animated", "themeable"],
  "usage": "Example: <ComponentName prop1='value' prop2={true} />"
}

STYLING GUIDELINES:
- Primary: Use Tailwind CSS classes for rapid development and consistency
- Secondary: Provide custom CSS only when Tailwind limitations require it
- Ensure dark mode compatibility with dark: prefixes
- Include comprehensive responsive breakpoints (sm:, md:, lg:, xl:, 2xl:)
- Implement smooth transitions and micro-interactions
- Use modern CSS features (Grid, Flexbox, CSS Variables)
- Ensure proper color contrast ratios (WCAG AA compliance)

COMPONENT CATEGORIES & EXAMPLES:
- UI: Buttons, cards, badges, avatars, tooltips, dropdowns
- Layout: Headers, sidebars, grids, containers, sections
- Form: Inputs, selects, checkboxes, radio buttons, validation
- Data: Tables, lists, charts, pagination, search
- Animation: Loaders, spinners, transitions, micro-interactions
- Navigation: Menus, breadcrumbs, tabs, pagination
- Feedback: Alerts, modals, notifications, toasts
- Utility: Hooks, context providers, higher-order components

ACCESSIBILITY REQUIREMENTS:
- Use semantic HTML elements (button, nav, main, section, etc.)
- Include proper ARIA labels, roles, and descriptions
- Ensure keyboard navigation support (Tab, Enter, Escape, Arrow keys)
- Provide screen reader compatibility
- Maintain proper focus management
- Include skip links where appropriate
- Ensure color is not the only means of conveying information

PERFORMANCE OPTIMIZATION:
- Use React.memo for expensive components
- Implement proper key props for lists
- Avoid unnecessary re-renders
- Use useCallback and useMemo appropriately
- Lazy load heavy components when possible

COMPONENT STRUCTURE REQUIREMENTS:
- Include proper TypeScript types when beneficial
- Add comprehensive error boundaries
- Implement loading and error states
- Include proper prop validation
- Add helpful developer warnings
- Ensure components are easily testable

MODERN REACT PATTERNS:
- Use hooks for state management (useState, useEffect, useReducer)
- Implement custom hooks for reusable logic
- Use context for global state when appropriate
- Follow the composition pattern over inheritance
- Implement proper cleanup in useEffect

Always create components that are:
- Production-ready and thoroughly tested
- Well-documented with clear examples
- Responsive and mobile-first
- Accessible to all users including those with disabilities
- Performant and optimized for real-world usage
- Easy to customize, extend, and maintain
- Following modern React and web development best practices`;
  }

  // Build user prompt with context
  buildUserPrompt(message, currentComponent, context) {
    let prompt = `User Request: ${message}\n\n`;

    if (currentComponent && currentComponent.jsx) {
      prompt += `Current Component:\n\`\`\`jsx\n${currentComponent.jsx}\n\`\`\`\n\n`;
      if (currentComponent.css) {
        prompt += `Current CSS:\n\`\`\`css\n${currentComponent.css}\n\`\`\`\n\n`;
      }
      prompt += 'Please modify the existing component based on the user request.\n\n';
    } else {
      prompt += 'Please create a new React component based on the user request.\n\n';
    }

    prompt += 'Remember to respond with a valid JSON object as specified in the system prompt.';

    return prompt;
  }

  // Format conversation context for AI
  formatContext(context) {
    return context.slice(-5).reverse().map(msg => ({
      role: msg.role,
      content: msg.role === 'assistant' && msg.content.code?.jsx 
        ? `Generated component:\n\`\`\`jsx\n${msg.content.code.jsx}\n\`\`\``
        : msg.content.text || 'No content'
    }));
  }

  // Call OpenRouter AI API
  async callOpenRouterAI(options) {
    const { model, messages, temperature, max_tokens } = options;

    const response = await axios.post(`${this.openRouterConfig.baseURL}/chat/completions`, {
      model,
      messages,
      temperature,
      max_tokens,
      stream: false
    }, {
      headers: {
        'Authorization': `Bearer ${this.openRouterConfig.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Component Generator Platform'
      },
      timeout: 60000
    });

    return response.data;
  }

  // Call Gemini AI API
  async callGeminiAI(options) {
    const { model, prompt, temperature, maxTokens } = options;

    const response = await axios.post(
      `${this.geminiConfig.baseURL}/models/${model}:generateContent?key=${this.geminiConfig.apiKey}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000
      }
    );

    return response.data;
  }

  // Legacy method for backward compatibility
  async callAI(payload) {
    const response = await axios.post(`${this.openRouterConfig.baseURL}/chat/completions`, payload, {
      headers: {
        'Authorization': `Bearer ${this.openRouterConfig.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'Component Generator Platform'
      },
      timeout: 60000
    });

    return response.data;
  }

  // Parse AI response and extract component data
  parseAIResponse(response) {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      // Try to extract JSON from the response
      let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        jsonMatch = content.match(/\{[\s\S]*\}/);
      }

      let parsedResponse;
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire content as JSON
        parsedResponse = JSON.parse(content);
      }

      // Validate required fields
      if (!parsedResponse.jsx && !parsedResponse.componentName) {
        throw new Error('Invalid AI response format');
      }

      // Add token usage information
      parsedResponse.tokens = {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0
      };

      return parsedResponse;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Raw response:', response.choices[0]?.message?.content);
      
      // Return a fallback response
      return {
        componentName: 'ErrorComponent',
        explanation: 'Failed to generate component due to parsing error',
        jsx: `function ErrorComponent() {
  return (
    <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      <h3 className="font-bold">Generation Error</h3>
      <p>Sorry, there was an error generating your component. Please try again.</p>
    </div>
  );
}

export default ErrorComponent;`,
        css: '',
        props: {},
        dependencies: [],
        category: 'other',
        complexity: 'simple',
        tokens: {
          prompt: response.usage?.prompt_tokens || 0,
          completion: response.usage?.completion_tokens || 0,
          total: response.usage?.total_tokens || 0
        }
      };
    }
  }



  // Validate component code
  validateComponent(jsx) {
    // Basic validation checks
    const checks = {
      hasExport: jsx.includes('export'),
      hasFunction: jsx.includes('function') || jsx.includes('const') || jsx.includes('=>'),
      hasReturn: jsx.includes('return'),
      hasJSX: jsx.includes('<') && jsx.includes('>'),
      isValid: true
    };

    // Check for common syntax errors
    const openBraces = (jsx.match(/\{/g) || []).length;
    const closeBraces = (jsx.match(/\}/g) || []).length;
    const openParens = (jsx.match(/\(/g) || []).length;
    const closeParens = (jsx.match(/\)/g) || []).length;

    if (openBraces !== closeBraces || openParens !== closeParens) {
      checks.isValid = false;
      checks.error = 'Mismatched braces or parentheses';
    }

    return checks;
  }

  // Parse Gemini response
  parseGeminiResponse(response) {
    try {
      const content = response.candidates[0]?.content?.parts[0]?.text;
      if (!content) {
        throw new Error('No content in Gemini response');
      }

      // Try to extract JSON from the response
      let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      if (!jsonMatch) {
        jsonMatch = content.match(/\{[\s\S]*\}/);
      }

      let parsedResponse;
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // Fallback: try to extract code blocks
        const jsxMatch = content.match(/```(?:jsx|javascript|js)\n([\s\S]*?)\n```/);
        const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);

        parsedResponse = {
          jsx: jsxMatch ? jsxMatch[1] : content,
          css: cssMatch ? cssMatch[1] : '',
          explanation: 'Component generated successfully',
          componentName: 'Generated Component'
        };
      }

      return {
        componentName: parsedResponse.componentName || 'Generated Component',
        explanation: parsedResponse.explanation || 'Component generated successfully',
        jsx: parsedResponse.jsx || '',
        css: parsedResponse.css || '',
        props: parsedResponse.props || {},
        dependencies: parsedResponse.dependencies || ['react'],
        category: parsedResponse.category || 'general',
        complexity: parsedResponse.complexity || 'medium',
        rawResponse: content,
        tokens: { prompt: 0, completion: 0, total: 0 } // Gemini doesn't provide token usage
      };

    } catch (error) {
      console.error('Error parsing Gemini response:', error);

      // Fallback parsing
      const content = response.candidates[0]?.content?.parts[0]?.text || '';
      const jsxMatch = content.match(/```(?:jsx|javascript|js)\n([\s\S]*?)\n```/);
      const cssMatch = content.match(/```css\n([\s\S]*?)\n```/);

      return {
        componentName: 'Generated Component',
        explanation: 'Component generated successfully (with parsing fallback)',
        jsx: jsxMatch ? jsxMatch[1] : content,
        css: cssMatch ? cssMatch[1] : '',
        props: {},
        dependencies: ['react'],
        category: 'general',
        complexity: 'medium',
        rawResponse: content,
        tokens: { prompt: 0, completion: 0, total: 0 }
      };
    }
  }

  // Format context for Gemini (simpler format)
  formatContextForGemini(context) {
    if (!context || context.length === 0) return '';

    return context.map(msg =>
      `${msg.role}: ${msg.content.text || msg.content || 'No content'}`
    ).join('\n');
  }
}

module.exports = new AIService();
