import { useEffect, type ReactNode } from "react";

export function ModalCloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900"
    >
      ✕
    </button>
  );
}

interface ModalOverlayProps {
  label: string;
  dialogClassName: string;
  onClose: () => void;
  children: ReactNode;
}

export function ModalOverlay({
  label,
  dialogClassName,
  onClose,
  children,
}: ModalOverlayProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={dialogClassName}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
