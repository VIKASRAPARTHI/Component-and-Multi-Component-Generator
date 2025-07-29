import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import useUIStore from '@/store/uiStore';
import Sidebar from './Sidebar';
import Header from './Header';
import NotificationContainer from '../UI/NotificationContainer';

export default function MainLayout({ children, requireAuth = true }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();
  const { sidebarOpen, theme } = useUIStore();

  useEffect(() => {
    if (requireAuth && !isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 ${theme}`}>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header />

          {/* Main content */}
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
}
