import { useEffect, useRef } from 'react';
import useSessionStore from '@/store/sessionStore';
import useUIStore from '@/store/uiStore';
import { sessionAPI } from '@/utils/api';

export default function useAutoSave() {
  const { 
    currentSession, 
    hasUnsavedChanges, 
    autoSaveEnabled, 
    markSaved,
    setError 
  } = useSessionStore();
  const { addNotification } = useUIStore();
  
  const saveTimeoutRef = useRef(null);
  const lastSaveRef = useRef(null);

  useEffect(() => {
    if (!autoSaveEnabled || !currentSession || !hasUnsavedChanges) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for auto-save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveSession();
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentSession, hasUnsavedChanges, autoSaveEnabled]);

  const saveSession = async () => {
    if (!currentSession) return;

    try {
      const sessionData = {
        title: currentSession.title,
        description: currentSession.description,
        currentComponent: currentSession.currentComponent,
        settings: currentSession.settings
      };

      await sessionAPI.updateSession(currentSession.id, sessionData);
      markSaved();
      lastSaveRef.current = new Date();

      // Show subtle success notification
      addNotification({
        type: 'success',
        title: 'Auto-saved',
        message: 'Your changes have been saved',
        duration: 2000
      });
    } catch (error) {
      setError('Failed to auto-save session');
      addNotification({
        type: 'error',
        title: 'Auto-save failed',
        message: 'Your changes could not be saved automatically'
      });
    }
  };

  const forceSave = async () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    await saveSession();
  };

  return {
    forceSave,
    lastSave: lastSaveRef.current
  };
}
