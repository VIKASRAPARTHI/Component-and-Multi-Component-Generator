import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import useUIStore from '@/store/uiStore';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
};

export default function NotificationContainer() {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => {
        const Icon = iconMap[notification.type] || Info;
        const colorClass = colorMap[notification.type] || colorMap.info;

        return (
          <Transition
            key={notification.id}
            show={true}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className={`rounded-lg border p-4 shadow-lg ${colorClass}`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Icon size={20} />
                </div>
                <div className="ml-3 flex-1">
                  {notification.title && (
                    <h3 className="text-sm font-medium">
                      {notification.title}
                    </h3>
                  )}
                  {notification.message && (
                    <p className={`text-sm ${notification.title ? 'mt-1' : ''}`}>
                      {notification.message}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current"
                  >
                    <span className="sr-only">Close</span>
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        );
      })}
    </div>
  );
}
