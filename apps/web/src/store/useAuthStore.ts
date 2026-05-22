import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  activeOrgId: string | null;
  isLoaded: boolean;
  setUser: (user: User | null) => void;
  setActiveOrgId: (orgId: string | null) => void;
  setLoaded: (loaded: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      activeOrgId: null,
      isLoaded: false,
      setUser: (user) => set({ user }),
      setActiveOrgId: (activeOrgId) => set({ activeOrgId }),
      setLoaded: (isLoaded) => set({ isLoaded }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ activeOrgId: state.activeOrgId }),
    }
  )
);