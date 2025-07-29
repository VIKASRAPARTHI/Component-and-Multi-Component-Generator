import { useState } from 'react';
import { MoreVertical, Edit2, Copy, Trash2, MessageSquare } from 'lucide-react';
import { Menu } from '@headlessui/react';

export default function SessionList({ sessions, currentSession, onSessionSelect, onSessionDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleEditStart = (session) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleEditSave = (sessionId) => {
    // TODO: Implement session title update
    setEditingId(null);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
          <MessageSquare size={20} className="text-gray-400" />
        </div>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          No Sessions Yet
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Create your first session to start generating components.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {sessions.map((session) => (
        <div
          key={session.id}
          className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
            currentSession?.id === session.id 
              ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
              : ''
          }`}
          onClick={() => onSessionSelect(session)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {editingId === session.id ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleEditSave(session.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditSave(session.id);
                    } else if (e.key === 'Escape') {
                      handleEditCancel();
                    }
                  }}
                  className="w-full px-2 py-1 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session.title}
                </h3>
              )}
              
              {session.description && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {session.description}
                </p>
              )}
              
              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDate(session.metadata?.lastActivity || session.updatedAt)}</span>
                <span>{session.metadata?.totalMessages || 0} messages</span>
              </div>
            </div>

            <Menu as="div" className="relative ml-2">
              <Menu.Button
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical size={16} />
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditStart(session);
                        }}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <Edit2 size={14} className="mr-3" />
                        Rename
                      </button>
                    )}
                  </Menu.Item>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement session duplication
                        }}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                      >
                        <Copy size={14} className="mr-3" />
                        Duplicate
                      </button>
                    )}
                  </Menu.Item>

                  <div className="border-t border-gray-100 dark:border-gray-700"></div>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this session?')) {
                            onSessionDelete(session.id);
                          }
                        }}
                        className={`${
                          active ? 'bg-gray-100 dark:bg-gray-700' : ''
                        } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                      >
                        <Trash2 size={14} className="mr-3" />
                        Delete
                      </button>
                    )}
                  </Menu.Item>
                </div>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      ))}
    </div>
  );
}
