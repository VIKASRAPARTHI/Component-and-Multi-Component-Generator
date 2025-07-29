import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // State
  theme: 'light',
  sidebarOpen: true,
  chatPanelWidth: 400,
  previewPanelWidth: 600,
  activeTab: 'jsx', // jsx, css, preview
  isGenerating: false,
  notifications: [],
  
  // Modal states
  modals: {
    sessionSettings: false,
    exportComponent: false,
    userProfile: false,
    sessionList: false
  },

  // Actions
  setTheme: (theme) => set({ theme }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setChatPanelWidth: (width) => set({ chatPanelWidth: Math.max(300, Math.min(600, width)) }),
  
  setPreviewPanelWidth: (width) => set({ previewPanelWidth: Math.max(400, Math.min(800, width)) }),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setGenerating: (isGenerating) => set({ isGenerating }),

  // Modal management
  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true }
  })),
  
  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false }
  })),
  
  closeAllModals: () => set((state) => ({
    modals: Object.keys(state.modals).reduce((acc, key) => {
      acc[key] = false;
      return acc;
    }, {})
  })),

  // Notification management
  addNotification: (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));

    // Auto-remove notification
    if (newNotification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(notification => notification.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),

  // Layout helpers
  getLayoutConfig: () => {
    const { sidebarOpen, chatPanelWidth, previewPanelWidth } = get();
    return {
      sidebarOpen,
      chatPanelWidth,
      previewPanelWidth,
      mainContentWidth: sidebarOpen 
        ? `calc(100vw - ${chatPanelWidth}px)` 
        : '100vw'
    };
  },

  // Responsive helpers
  setResponsiveLayout: (screenSize) => {
    if (screenSize === 'mobile') {
      set({
        sidebarOpen: false,
        chatPanelWidth: 300,
        previewPanelWidth: 400
      });
    } else if (screenSize === 'tablet') {
      set({
        sidebarOpen: true,
        chatPanelWidth: 350,
        previewPanelWidth: 500
      });
    } else {
      set({
        sidebarOpen: true,
        chatPanelWidth: 400,
        previewPanelWidth: 600
      });
    }
  },

  // Keyboard shortcuts
  handleKeyboardShortcut: (key, ctrlKey, shiftKey) => {
    const { setActiveTab, toggleSidebar, openModal } = get();
    
    if (ctrlKey) {
      switch (key) {
        case '1':
          setActiveTab('jsx');
          break;
        case '2':
          setActiveTab('css');
          break;
        case '3':
          setActiveTab('preview');
          break;
        case 'b':
          toggleSidebar();
          break;
        case 's':
          // Save shortcut - handled by session store
          break;
        case 'e':
          openModal('exportComponent');
          break;
        default:
          break;
      }
    }
  }
}));

export default useUIStore;
