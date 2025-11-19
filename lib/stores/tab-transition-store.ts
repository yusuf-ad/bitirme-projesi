import { create } from "zustand";

interface TabTransitionState {
  isScrubbing: boolean;
  setScrubbing: (isScrubbing: boolean) => void;
}

export const useTabTransitionStore = create<TabTransitionState>((set) => ({
  isScrubbing: false,
  setScrubbing: (isScrubbing) => set({ isScrubbing }),
}));
