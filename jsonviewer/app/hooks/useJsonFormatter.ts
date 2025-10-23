import { useCallback } from 'react';

interface FormatResult {
  success: boolean;
  formatted?: string;
  error?: string;
}

export const useJsonFormatter = () => {
  const formatJson = useCallback((text: string): FormatResult => {
    try {
      if (!text.trim()) {
        return { success: false, error: "It's not json" };
      }

      const parsed = JSON.parse(text);
      const formatted = JSON.stringify(parsed, null, 2);
      return { success: true, formatted };
    } catch (error) {
      return { success: false, error: "It's not json" };
    }
  }, []);

  const formatDualJson = useCallback((
    leftText: string,
    rightText: string
  ): { leftResult: FormatResult; rightResult: FormatResult } => {
    const leftResult = formatJson(leftText);
    const rightResult = formatJson(rightText);

    return { leftResult, rightResult };
  }, [formatJson]);

  return {
    formatJson,
    formatDualJson,
  };
};
