'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MessageSquare, Code, LogOut, Settings } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useSessionStore from '@/store/sessionStore';
import { sessionAPI } from '@/utils/api';
import ClientOnly from '@/components/ClientOnly';

export default function Home() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading } = useAuthStore();
  const { sessions, setSessions, setCurrentSession } = useSessionStore();
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated, isLoading]);

  const loadSessions = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping session load');
      return;
    }

    try {
      setSessionsLoading(true);
      console.log('Loading sessions...');
      const response = await sessionAPI.getSessions();
      console.log('Sessions loaded:', response.data);
      setSessions(response.data.data || response.data || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      // If it's an auth error, don't show sessions
      if (error.response?.status === 401) {
        console.log('Authentication required for sessions');
        setSessions([]);
      }
    } finally {
      setSessionsLoading(false);
    }
  };

  const createNewSession = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot create session');
      return;
    }

    try {
      console.log('Creating new session...');
      const response = await sessionAPI.createSession({
        title: `New Session ${new Date().toLocaleDateString()}`,
        description: 'AI-powered component generation session'
      });

      console.log('Session created:', response.data);
      const newSession = response.data.data || response.data;
      setCurrentSession(newSession);
      router.push('/workspace');
    } catch (error) {
      console.error('Failed to create session:', error);
      if (error.response?.status === 401) {
        console.log('Authentication required for session creation');
      }
    }
  };

  const openSession = (session) => {
    setCurrentSession(session);
    router.push('/workspace');
  };

  const handleLogout = () => {
    logout();
    // Stay on the same page, but it will show the landing page for unauthenticated users
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show authenticated user's dashboard
  if (isAuthenticated) {
    return (
      <ClientOnly fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      }>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Component Generator
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Welcome, {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to your Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Create and manage your AI-generated React components
              </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={createNewSession}
                    className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium text-blue-900 dark:text-blue-100">
                        New Session
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-300">
                        Start generating components
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <Code className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {sessions.length} Sessions
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total created
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        AI Powered
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Component generation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Sessions
                </h3>
              </div>
              <div className="p-6">
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No sessions yet
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Create your first session to start generating components
                    </p>
                    <button
                      onClick={createNewSession}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Session
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.slice(0, 6).map((session, index) => (
                      <div
                        key={session.id || session._id || `session-${index}`}
                        onClick={() => openSession(session)}
                        className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                          {session.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {session.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {session.metadata?.totalMessages || 0} messages
                          </span>
                          <span>
                            {new Date(session.metadata?.lastActivity || session.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </ClientOnly>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #000000 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center', padding: '2rem' }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '1.5rem',
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }}>
          Component Generator Platform
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: '#e5e7eb',
          marginBottom: '2rem',
          textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
        }}>
          AI-driven micro-frontend playground for generating React components
        </p>
        <div style={{ marginBottom: '1rem' }}>
          <a
            href="/auth/login"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.1rem',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
            }}
          >
            Get Started
          </a>
          <p style={{
            fontSize: '0.875rem',
            color: '#d1d5db',
            marginTop: '1rem',
            textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
          }}>
            Create an account or sign in to start building components
          </p>
        </div>

        <div style={{
          marginTop: '3rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              AI-Powered Generation
            </h3>
            <p style={{ color: '#e5e7eb' }}>
              Describe your component in natural language and watch it come to life
            </p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              Live Preview
            </h3>
            <p style={{ color: '#e5e7eb' }}>
              See your components rendered in real-time with hot reload
            </p>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'white',
              marginBottom: '0.5rem'
            }}>
              Export & Share
            </h3>
            <p style={{ color: '#e5e7eb' }}>
              Download your components as ZIP files or copy to clipboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
