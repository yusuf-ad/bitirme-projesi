import React, { createContext, useCallback, useContext, useState } from "react";

export type AttachMenuRoute = "index" | "recipes" | "pantry" | "(profile)";

interface AttachMenuContextType {
  isOpen: boolean;
  currentRoute: AttachMenuRoute;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
  setCurrentRoute: (route: AttachMenuRoute) => void;
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
  const [currentRoute, setCurrentRoute] = useState<AttachMenuRoute>("index");

  const openMenu = useCallback(() => setIsOpen(true), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);
  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <AttachMenuContext.Provider
      value={{
        isOpen,
        currentRoute,
        openMenu,
        closeMenu,
        toggleMenu,
        setCurrentRoute,
      }}
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
