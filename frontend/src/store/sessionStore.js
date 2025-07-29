import { create } from 'zustand';

const useSessionStore = create((set, get) => ({
  // State
  sessions: [],
  currentSession: null,
  messages: [],
  isLoading: false,
  error: null,
  
  // Auto-save state
  autoSaveEnabled: true,
  lastSaved: null,
  hasUnsavedChanges: false,

  // Actions
  setSessions: (sessions) => set({ sessions: Array.isArray(sessions) ? sessions : [] }),
  
  setCurrentSession: (session) => set({ 
    currentSession: session,
    hasUnsavedChanges: false 
  }),
  
  setMessages: (messages) => set({ messages }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),

  // Session management
  addSession: (session) => set((state) => ({
    sessions: [session, ...state.sessions]
  })),
  
  updateSession: (sessionId, updates) => set((state) => ({
    sessions: state.sessions.map(session => 
      session.id === sessionId ? { ...session, ...updates } : session
    ),
    currentSession: state.currentSession?.id === sessionId 
      ? { ...state.currentSession, ...updates }
      : state.currentSession,
    hasUnsavedChanges: true
  })),
  
  removeSession: (sessionId) => set((state) => ({
    sessions: state.sessions.filter(session => session.id !== sessionId),
    currentSession: state.currentSession?.id === sessionId ? null : state.currentSession
  })),

  // Message management
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  updateMessage: (messageId, updates) => set((state) => ({
    messages: state.messages.map(message => 
      message.id === messageId ? { ...message, ...updates } : message
    )
  })),
  
  removeMessage: (messageId) => set((state) => ({
    messages: state.messages.filter(message => message.id !== messageId)
  })),

  // Component management
  updateCurrentComponent: (componentData) => set((state) => {
    const updatedSession = state.currentSession ? {
      ...state.currentSession,
      currentComponent: {
        ...state.currentSession.currentComponent,
        ...componentData
      }
    } : null;

    return {
      currentSession: updatedSession,
      hasUnsavedChanges: true
    };
  }),

  // Auto-save management
  setAutoSave: (enabled) => set({ autoSaveEnabled: enabled }),
  
  markSaved: () => set({ 
    lastSaved: new Date().toISOString(),
    hasUnsavedChanges: false 
  }),
  
  markUnsaved: () => set({ hasUnsavedChanges: true }),

  // Reset store
  reset: () => set({
    sessions: [],
    currentSession: null,
    messages: [],
    isLoading: false,
    error: null,
    hasUnsavedChanges: false
  }),

  // Computed getters
  getCurrentComponent: () => {
    const { currentSession } = get();
    return currentSession?.currentComponent || { jsx: '', css: '', props: {} };
  },
  
  getSessionById: (sessionId) => {
    const { sessions } = get();
    return sessions.find(session => session.id === sessionId);
  },
  
  getRecentSessions: (limit = 5) => {
    const { sessions } = get();
    return sessions
      .sort((a, b) => new Date(b.metadata?.lastActivity || b.updatedAt) - new Date(a.metadata?.lastActivity || a.updatedAt))
      .slice(0, limit);
  }
}));

export default useSessionStore;
