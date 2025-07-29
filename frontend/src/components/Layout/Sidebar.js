import { useState, useEffect, useCallback } from 'react';
import { Plus, MessageSquare, History, Search, Filter } from 'lucide-react';
import useSessionStore from '@/store/sessionStore';
import useUIStore from '@/store/uiStore';
import { sessionAPI } from '@/utils/api';
import SessionList from '../Session/SessionList';
import ChatPanel from '../Chat/ChatPanel';

export default function Sidebar() {
  const [activeView, setActiveView] = useState('chat'); // 'chat', 'sessions'
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    sessions, 
    currentSession, 
    setSessions, 
    setCurrentSession, 
    addSession,
    setLoading,
    setError 
  } = useSessionStore();
  const { chatPanelWidth, setChatPanelWidth, openModal } = useUIStore();

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await sessionAPI.getSessions({ search: searchQuery });
      setSessions(response.data.data);
    } catch (error) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, setLoading, setSessions]);

  const handleCreateSession = async () => {
    try {
      const response = await sessionAPI.createSession({
        title: `New Session ${new Date().toLocaleDateString()}`,
        description: ''
      });
      const newSession = response.data.data;
      addSession(newSession);
      setCurrentSession(newSession);
      setActiveView('chat');
    } catch (error) {
      setError('Failed to create session');
    }
  };

  const handleSessionSelect = async (session) => {
    try {
      setCurrentSession(session);
      setActiveView('chat');
    } catch (error) {
      setError('Failed to load session');
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full"
      style={{ width: `${chatPanelWidth}px` }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Component Generator
          </h2>
          <button
            onClick={handleCreateSession}
            className="p-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="New Session"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* View toggle */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveView('chat')}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'chat'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <MessageSquare size={16} className="mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActiveView('sessions')}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'sessions'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <History size={16} className="mr-2" />
            Sessions
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'chat' ? (
          <ChatPanel />
        ) : (
          <div className="h-full flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto">
              <SessionList
                sessions={filteredSessions}
                currentSession={currentSession}
                onSessionSelect={handleSessionSelect}
                onSessionDelete={(sessionId) => {
                  // Handle session deletion
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-col-resize absolute right-0 top-0 h-full"
        onMouseDown={(e) => {
          const startX = e.clientX;
          const startWidth = chatPanelWidth;

          const handleMouseMove = (e) => {
            const newWidth = startWidth + (e.clientX - startX);
            setChatPanelWidth(newWidth);
          };

          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };

          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />
    </div>
  );
}
