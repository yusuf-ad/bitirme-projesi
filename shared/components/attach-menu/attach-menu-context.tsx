import React, { createContext, useCallback, useContext, useState } from "react";

interface AttachMenuContextType {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const AttachMenuContext = createContext<AttachMenuContextType | undefined>(
  undefined
);

export function AttachMenuProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <AttachMenuContext.Provider
      value={{ isOpen, openMenu, closeMenu, toggleMenu }}
    >
      {children}
    </AttachMenuContext.Provider>
  );
}

export function useAttachMenu() {
  const context = useContext(AttachMenuContext);
  if (!context) {
    throw new Error("useAttachMenu must be used within an AttachMenuProvider");
  }
  return context;
}
