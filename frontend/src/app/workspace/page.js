'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Code, Eye, Copy, Download, Settings, Sparkles } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useSessionStore from '@/store/sessionStore';
import { chatAPI } from '@/utils/api';
import ClientOnly from '@/components/ClientOnly';
import ModelSelector from '@/components/ModelSelector';
import ComponentPreview from '@/components/ComponentPreview';

export default function WorkspacePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentSession } = useSessionStore();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [generatedCode, setGeneratedCode] = useState({ jsx: '', css: '' });
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (!currentSession) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, currentSession, router]);

  const handleSendMessage = async () => {
    if (!message.trim() || isGenerating) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: { text: message },
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message.trim();
    setMessage('');
    setIsGenerating(true);

    try {
      const response = await chatAPI.generateComponent({
        sessionId: currentSession.id,
        message: currentMessage,
        model: selectedModel
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: {
          text: response.data.explanation || 'Component generated successfully!',
          code: {
            jsx: response.data.jsx || '',
            css: response.data.css || ''
          },
          componentName: response.data.componentName,
          props: response.data.props,
          dependencies: response.data.dependencies
        },
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setGeneratedCode({
        jsx: response.data.jsx || '',
        css: response.data.css || ''
      });
      setActiveTab('jsx');

    } catch (error) {
      console.error('Failed to generate component:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: {
          text: `Sorry, I encountered an error while generating the component: ${error.message || 'Please try again.'}`
        },
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e) => {
    if ((e.key === 'Enter' && e.ctrlKey) || (e.key === 'Enter' && !e.shiftKey)) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyCode = async () => {
    const code = activeTab === 'jsx' ? generatedCode.jsx : generatedCode.css;
    try {
      await navigator.clipboard.writeText(code);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  if (!isAuthenticated || !currentSession) {
    return null;
  }

  return (
    <ClientOnly fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentSession.title}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Model Selector */}
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                  className="min-w-48"
                />
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Generation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Temperature
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    defaultValue="0.7"
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Conservative</span>
                    <span>Creative</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Tokens
                  </label>
                  <select className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="2000">2000</option>
                    <option value="4000" selected>4000</option>
                    <option value="8000">8000</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Style
                  </label>
                  <select className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option value="modern">Modern</option>
                    <option value="minimal">Minimal</option>
                    <option value="colorful">Colorful</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('jsx')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'jsx'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Code size={16} className="mr-1" />
                JSX
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'css'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Code size={16} className="mr-1" />
                CSS
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Eye size={16} className="mr-1" />
                Preview
              </button>
            </div>

            {/* Code Actions */}
            {(activeTab === 'jsx' || activeTab === 'css') && generatedCode.jsx && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={copyCode}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Copy size={14} />
                  <span>Copy</span>
                </button>
                <button
                  onClick={() => {
                    const code = activeTab === 'jsx' ? generatedCode.jsx : generatedCode.css;
                    const blob = new Blob([code], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `component.${activeTab}`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat Panel */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <Send size={24} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Start Creating
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Describe the component you want to create and I'll generate it for you.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div key={msg.id || `message-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                      <div className={`max-w-3xl rounded-lg px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content.text}</p>
                        {msg.content.code && (
                          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                ✓ Component Generated
                              </span>
                              {msg.content.componentName && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {msg.content.componentName}
                                </span>
                              )}
                            </div>
                            {msg.content.dependencies && msg.content.dependencies.length > 1 && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                Dependencies: {msg.content.dependencies.join(', ')}
                              </div>
                            )}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setActiveTab('jsx')}
                                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              >
                                View JSX
                              </button>
                              {msg.content.code.css && (
                                <button
                                  onClick={() => setActiveTab('css')}
                                  className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                >
                                  View CSS
                                </button>
                              )}
                              <button
                                onClick={() => setActiveTab('preview')}
                                className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                              >
                                Preview
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600 dark:text-gray-400">Generating component...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-4xl mx-auto">
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe the component you want to create... (e.g., 'Create a modern login form with email and password fields')"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                        rows={3}
                        disabled={isGenerating}
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Press Ctrl+Enter to send</span>
                          <span>•</span>
                          <span>Model: {selectedModel}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {message.length}/2000
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || isGenerating}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[80px]"
                      >
                        {isGenerating ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Send size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => setMessage('')}
                        disabled={isGenerating}
                        className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Quick Prompts */}
                  <div className="mt-4">
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick prompts:</div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Create a modern button component',
                        'Build a responsive card layout',
                        'Design a contact form',
                        'Make a loading spinner',
                        'Create a navigation menu'
                      ].map((prompt) => (
                        <button
                          key={prompt}
                          onClick={() => setMessage(prompt)}
                          disabled={isGenerating}
                          className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Code Panels */}
          {(activeTab === 'jsx' || activeTab === 'css') && (
            <div className="flex-1 bg-gray-900 text-gray-100 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-medium">
                  {activeTab === 'jsx' ? 'JSX Code' : 'CSS Styles'}
                </h3>
                <button
                  onClick={copyCode}
                  className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                >
                  <Copy size={16} />
                  <span>Copy</span>
                </button>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                <pre className="text-sm">
                  <code>
                    {activeTab === 'jsx' ? generatedCode.jsx || '// No JSX code generated yet' : generatedCode.css || '/* No CSS styles generated yet */'}
                  </code>
                </pre>
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {activeTab === 'preview' && (
            <div className="flex-1">
              <ComponentPreview
                jsx={generatedCode.jsx}
                css={generatedCode.css}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}
