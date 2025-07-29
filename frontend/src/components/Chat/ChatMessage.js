import { useState } from 'react';
import { User, Bot, Copy, Check, Code, Eye, Loader2 } from 'lucide-react';
import useUIStore from '@/store/uiStore';

export default function ChatMessage({ message }) {
  const [copied, setCopied] = useState(false);
  const { setActiveTab, addNotification } = useUIStore();

  const isUser = message.role === 'user';
  const isProcessing = message.status === 'processing';
  const hasFailed = message.status === 'failed';

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      addNotification({
        type: 'success',
        title: 'Copied!',
        message: 'Code copied to clipboard',
        duration: 2000
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Copy Failed',
        message: 'Failed to copy code to clipboard'
      });
    }
  };

  const handleViewCode = (type) => {
    setActiveTab(type);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}>
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>
        </div>

        {/* Message content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message bubble */}
          <div className={`rounded-lg px-4 py-2 max-w-full ${
            isUser
              ? 'bg-blue-600 text-white'
              : hasFailed
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
          }`}>
            {/* Text content */}
            {message.content.text && (
              <div className="whitespace-pre-wrap break-words">
                {message.content.text}
              </div>
            )}

            {/* Images */}
            {message.content.images && message.content.images.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.content.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt || 'Message image'}
                    className="max-w-full h-auto rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex items-center space-x-2 mt-2 text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Generating component...</span>
              </div>
            )}

            {/* Error message */}
            {hasFailed && message.error && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                <strong>Error:</strong> {message.error.message}
              </div>
            )}

            {/* Code content */}
            {message.content.code && (message.content.code.jsx || message.content.code.css) && (
              <div className="mt-3 space-y-2">
                {/* JSX Code */}
                {message.content.code.jsx && (
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 text-gray-300 text-sm">
                      <div className="flex items-center space-x-2">
                        <Code size={14} />
                        <span>JSX Component</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewCode('jsx')}
                          className="p-1 hover:bg-gray-700 rounded"
                          title="View in editor"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleCopyCode(message.content.code.jsx)}
                          className="p-1 hover:bg-gray-700 rounded"
                          title="Copy code"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <pre className="p-3 text-sm text-gray-300 overflow-x-auto">
                      <code>{message.content.code.jsx}</code>
                    </pre>
                  </div>
                )}

                {/* CSS Code */}
                {message.content.code.css && (
                  <div className="bg-gray-900 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-800 text-gray-300 text-sm">
                      <div className="flex items-center space-x-2">
                        <Code size={14} />
                        <span>CSS Styles</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewCode('css')}
                          className="p-1 hover:bg-gray-700 rounded"
                          title="View in editor"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleCopyCode(message.content.code.css)}
                          className="p-1 hover:bg-gray-700 rounded"
                          title="Copy code"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                    <pre className="p-3 text-sm text-gray-300 overflow-x-auto">
                      <code>{message.content.code.css}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamp and metadata */}
          <div className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
            {formatTimestamp(message.createdAt)}
            {message.metadata?.model && !isUser && (
              <span className="ml-2">• {message.metadata.model}</span>
            )}
            {message.metadata?.tokens?.total && !isUser && (
              <span className="ml-2">• {message.metadata.tokens.total} tokens</span>
            )}
            {message.metadata?.processingTime && !isUser && (
              <span className="ml-2">• {(message.metadata.processingTime / 1000).toFixed(1)}s</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
