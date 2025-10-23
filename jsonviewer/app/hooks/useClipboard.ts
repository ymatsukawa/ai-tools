import { useCallback } from 'react';

interface CopyResult {
  success: boolean;
  message: string;
}

export const useClipboard = () => {
  const copyToClipboard = useCallback(async (text: string): Promise<CopyResult> => {
    try {
      if (!text.trim()) {
        return { success: false, message: "Nothing to copy" };
      }

      await navigator.clipboard.writeText(text);
      return { success: true, message: "Copied to clipboard!" };
    } catch (error) {
      return { success: false, message: "Failed to copy to clipboard" };
    }
  }, []);

  return {
    copyToClipboard,
  };
};
