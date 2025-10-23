import { useState, useEffect } from 'react';

interface ValidationResult {
  isValid: boolean;
  invalidLines: Set<number>;
}

export const useJsonValidation = (jsonText: string) => {
  const [invalidLines, setInvalidLines] = useState<Set<number>>(new Set());

  const parseJson = (text: string): ValidationResult => {
    try {
      JSON.parse(text);
      return { isValid: true, invalidLines: new Set() };
    } catch (error) {
      const lines = text.split('\n');
      const invalidSet = new Set<number>();

      if (error instanceof SyntaxError) {
        // Extract position from error message
        const message = error.message;

        // Try to get line and column from error message
        // Chrome: "Unexpected token } in JSON at position 123"
        // Firefox: "JSON.parse: unexpected character at line 5 column 10 of the JSON data"
        const lineMatch = message.match(/line (\d+)/i);
        const posMatch = message.match(/position (\d+)/i);

        if (lineMatch) {
          // Firefox-style error with line number
          const lineNum = parseInt(lineMatch[1]) - 1; // Convert to 0-indexed
          if (lineNum >= 0 && lineNum < lines.length) {
            invalidSet.add(lineNum);
          }
        } else if (posMatch) {
          // Chrome-style error with position
          const position = parseInt(posMatch[1]);
          let currentPos = 0;
          for (let i = 0; i < lines.length; i++) {
            const lineEndPos = currentPos + lines[i].length;
            if (position >= currentPos && position <= lineEndPos) {
              invalidSet.add(i);
              break;
            }
            currentPos = lineEndPos + 1; // +1 for newline
          }
        }
      }

      // If we still couldn't find invalid lines, mark the last non-empty line
      if (invalidSet.size === 0) {
        for (let i = lines.length - 1; i >= 0; i--) {
          if (lines[i].trim()) {
            invalidSet.add(i);
            break;
          }
        }
      }

      return { isValid: false, invalidLines: invalidSet };
    }
  };

  // Auto-validate whenever jsonText changes
  useEffect(() => {
    if (jsonText.trim()) {
      const result = parseJson(jsonText);
      setInvalidLines(result.invalidLines);
    } else {
      setInvalidLines(new Set());
    }
  }, [jsonText]);

  return {
    invalidLines,
    isValid: invalidLines.size === 0 && jsonText.trim().length > 0,
  };
};
