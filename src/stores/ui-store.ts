import { create } from "zustand";

export type ToastType = "default" | "success" | "error" | "warning";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface UiStoreState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: "light";
  toasts: Toast[];
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setTheme: (theme: UiStoreState["theme"]) => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiStoreState>((set, get) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  theme: "light",
  toasts: [],
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleSidebarCollapsed: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
  setTheme: (theme) => set({ theme }),
  addToast: ({ title, description, type = "default" }) => {
    const id = Math.random().toString(36).slice(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, title, description, type }],
    }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 5000);
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

/** @deprecated Use useUiStore */
export const useUIStore = useUiStore;
