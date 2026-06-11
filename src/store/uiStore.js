import { create } from 'zustand';
import { Appearance } from 'react-native';

export const useUiStore = create((set, get) => ({
  theme: 'light', // 'light' | 'dark' | 'system'
  toasts: [],
  isOffline: false,
  activeModal: null,

  setTheme: (newTheme) => {
    set({ theme: newTheme });
  },

  showToast: (message, type = 'success') => {
    const id = `toast-${Date.now()}`;
    const newToast = { id, message, type };
    
    set({ toasts: [...get().toasts, newToast] });

    // Auto-remove toast after 3.5 seconds
    setTimeout(() => {
      get().hideToast(id);
    }, 3500);
  },

  hideToast: (id) => {
    set({
      toasts: get().toasts.filter(t => t.id !== id)
    });
  },

  setOfflineStatus: (offline) => {
    set({ isOffline: offline });
    if (offline) {
      get().showToast("Offline mode active. Operations cached locally.", "info");
    } else {
      get().showToast("Internet connected. Syncing local queues...", "success");
    }
  },

  openModal: (modalName) => set({ activeModal: modalName }),
  closeModal: () => set({ activeModal: null })
}));
