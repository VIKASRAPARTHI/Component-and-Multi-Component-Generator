'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Cpu, Zap, Brain, Star } from 'lucide-react';
import { chatAPI } from '@/utils/api';

export default function ModelSelector({ selectedModel, onModelChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState({ openrouter: [], gemini: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      // Use the authenticated API utility
      const response = await chatAPI.getModels();
      setModels(response.data.data || response.data);
    } catch (error) {
      console.error('Failed to fetch models:', error);
      // Fallback models - always available
      setModels({
        openrouter: [
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Fast and efficient' },
          { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Most capable' },
          { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast and lightweight' },
          { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: 'Balanced performance' },
        ],
        gemini: [
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google', description: 'Fast and efficient' },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', description: 'Most capable' },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const allModels = [...models.openrouter, ...models.gemini];
  const currentModel = allModels.find(m => m.id === selectedModel) || allModels[0];

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'OpenAI': return <Brain className="w-4 h-4 text-green-500" />;
      case 'Anthropic': return <Cpu className="w-4 h-4 text-orange-500" />;
      case 'Google': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'Meta': return <Star className="w-4 h-4 text-purple-500" />;
      default: return <Cpu className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProviderColor = (provider) => {
    switch (provider) {
      case 'OpenAI': return 'border-green-200 bg-green-50';
      case 'Anthropic': return 'border-orange-200 bg-orange-50';
      case 'Google': return 'border-blue-200 bg-blue-50';
      case 'Meta': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Loading models...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
      >
        <div className="flex items-center space-x-2">
          {getProviderIcon(currentModel?.provider)}
          <span className="font-medium text-gray-900 dark:text-white">
            {currentModel?.name || 'Select Model'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentModel?.provider}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* OpenRouter Models */}
          {models.openrouter.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 py-1">
                OpenRouter
              </div>
              {models.openrouter.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  {getProviderIcon(model.provider)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {model.name}
                      </span>
                      {selectedModel === model.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {model.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Gemini Models */}
          {models.gemini.length > 0 && (
            <div className="p-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2 py-1">
                Google Gemini
              </div>
              {models.gemini.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : ''
                  }`}
                >
                  {getProviderIcon(model.provider)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900 dark:text-white text-sm">
                        {model.name}
                      </span>
                      {selectedModel === model.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {model.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
