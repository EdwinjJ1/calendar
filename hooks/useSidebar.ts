import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  isMobileOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export const useSidebar = create<SidebarState>((set) => ({
  isOpen: false,
  isMobileOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  closeMobile: () => set({ isMobileOpen: false }),
}));
