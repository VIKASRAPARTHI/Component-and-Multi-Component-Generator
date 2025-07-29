import { useState, useEffect, useRef } from 'react';
import { Send, Image, Loader2 } from 'lucide-react';
import useSessionStore from '@/store/sessionStore';
import useUIStore from '@/store/uiStore';
import { chatAPI, sessionAPI } from '@/utils/api';
import ChatMessage from './ChatMessage';
import ImageUpload from './ImageUpload';

export default function ChatPanel() {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const { 
    currentSession, 
    messages, 
    setMessages, 
    addMessage, 
    updateMessage,
    updateCurrentComponent 
  } = useSessionStore();
  const { isGenerating, setGenerating, addNotification } = useUIStore();

  useEffect(() => {
    if (currentSession) {
      loadMessages();
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!currentSession) return;

    try {
      const response = await sessionAPI.getSessionMessages(currentSession.id);
      setMessages(response.data.data);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load chat history'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentSession || isGenerating) return;

    const userMessage = message.trim();
    const messageImages = [...images];
    
    // Clear input
    setMessage('');
    setImages([]);
    setGenerating(true);

    try {
      // Send message to API
      const response = await chatAPI.generateComponent({
        sessionId: currentSession.id,
        message: userMessage,
        images: messageImages,
        model: 'gpt-4o-mini',
        temperature: 0.7
      });

      // Add messages to local state
      addMessage(response.data.data.userMessage);
      addMessage(response.data.data.assistantMessage);

      // Poll for assistant message completion
      pollForCompletion(response.data.data.assistantMessage.id);

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error.response?.data?.message || 'Failed to generate component'
      });
      setGenerating(false);
    }
  };

  const pollForCompletion = async (messageId) => {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await chatAPI.getMessage(messageId);
        const message = response.data.data;

        // Update message in local state
        updateMessage(messageId, message);

        if (message.status === 'completed') {
          setGenerating(false);
          
          // Update current component if code was generated
          if (message.content.code && message.content.code.jsx) {
            updateCurrentComponent(message.content.code);
          }

          addNotification({
            type: 'success',
            title: 'Component Generated',
            message: 'Your component has been generated successfully!'
          });
        } else if (message.status === 'failed') {
          setGenerating(false);
          addNotification({
            type: 'error',
            title: 'Generation Failed',
            message: message.error?.message || 'Failed to generate component'
          });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(poll, 1000); // Poll every second
        } else {
          setGenerating(false);
          addNotification({
            type: 'error',
            title: 'Timeout',
            message: 'Component generation timed out'
          });
        }
      } catch (error) {
        setGenerating(false);
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to check generation status'
        });
      }
    };

    poll();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageUpload = (uploadedImages) => {
    setImages(prev => [...prev, ...uploadedImages]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!currentSession) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Send size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Session Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Create a new session or select an existing one to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Send size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Start Creating
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Describe the component you want to create and I&apos;ll generate it for you.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {/* Image previews */}
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image.url}
                  alt={image.alt || 'Uploaded image'}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the component you want to create..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              disabled={isGenerating}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <ImageUpload
              onUpload={handleImageUpload}
              disabled={isGenerating || isUploading}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Image size={20} />
            </ImageUpload>

            <button
              type="submit"
              disabled={!message.trim() || isGenerating}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
          </div>
        </form>

        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
