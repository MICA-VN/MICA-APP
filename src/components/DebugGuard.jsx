import { useEffect } from "react";

const isDebug = import.meta.env.VITE_IS_DEBUG === "true";

function DebugGuard() {
  useEffect(() => {
    if (isDebug) return undefined;

    const preventContextMenu = (event) => event.preventDefault();
    const preventDevToolsShortcuts = (event) => {
      const key = event.key.toLowerCase();
      const hasControlModifier = event.ctrlKey || event.metaKey;
      const hasDevToolsModifier = event.shiftKey || event.altKey;
      const isDevToolsShortcut =
        event.key === "F12" ||
        (hasControlModifier && key === "u") ||
        (hasControlModifier && hasDevToolsModifier && ["c", "i", "j", "k"].includes(key));

      if (isDevToolsShortcut) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", preventContextMenu, true);
    document.addEventListener("keydown", preventDevToolsShortcuts, true);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu, true);
      document.removeEventListener("keydown", preventDevToolsShortcuts, true);
    };
  }, []);

  return null;
}

export default DebugGuard;
