import { create } from "zustand";

interface AuthStoreState {
  isInitialized: boolean;
  setInitialized: (value: boolean) => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  isInitialized: false,
  setInitialized: (isInitialized) => set({ isInitialized }),
}));
