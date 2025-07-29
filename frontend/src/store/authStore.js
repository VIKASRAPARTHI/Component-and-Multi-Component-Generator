import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setToken: (token) => set({ token }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true, 
        error: null 
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        error: null 
      }),
      
      clearError: () => set({ error: null }),
      
      updateUser: (userData) => set((state) => ({
        user: { ...(state.user || {}), ...(userData || {}) }
      })),

      // Computed
      getAuthHeader: () => {
        const { token } = get();
        return token ? { Authorization: `Bearer ${token}` } : {};
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
