import { useState } from 'react';
import { Menu, X, Settings, User, LogOut, Sun, Moon } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import useSessionStore from '@/store/sessionStore';
import { Menu as HeadlessMenu } from '@headlessui/react';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, theme, setTheme, openModal } = useUIStore();
  const { currentSession, hasUnsavedChanges } = useSessionStore();

  const handleLogout = () => {
    logout();
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Sidebar toggle */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Current session info */}
          {currentSession && (
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentSession.title}
              </h1>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  Unsaved
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* User menu */}
          <HeadlessMenu as="div" className="relative">
            <HeadlessMenu.Button className="flex items-center space-x-2 p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium">
                {user?.name || 'User'}
              </span>
            </HeadlessMenu.Button>

            <HeadlessMenu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => openModal('userProfile')}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      <User size={16} className="mr-3" />
                      Profile
                    </button>
                  )}
                </HeadlessMenu.Item>

                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => openModal('sessionSettings')}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      <Settings size={16} className="mr-3" />
                      Settings
                    </button>
                  )}
                </HeadlessMenu.Item>

                <div className="border-t border-gray-100 dark:border-gray-700"></div>

                <HeadlessMenu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? 'bg-gray-100 dark:bg-gray-700' : ''
                      } flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                    >
                      <LogOut size={16} className="mr-3" />
                      Sign out
                    </button>
                  )}
                </HeadlessMenu.Item>
              </div>
            </HeadlessMenu.Items>
          </HeadlessMenu>
        </div>
      </div>
    </header>
  );
}
