import { useCallback } from 'react';
import Encoding from 'encoding-japanese';

interface UseFileUploadProps {
  onFileLoaded: (content: string) => void;
}

export const useFileUpload = ({ onFileLoaded }: UseFileUploadProps) => {
  const handleFileDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        // Detect encoding and convert to string
        const uint8Array = new Uint8Array(arrayBuffer);
        const detectedEncoding = Encoding.detect(uint8Array);
        const unicodeArray = Encoding.convert(uint8Array, {
          to: 'UNICODE',
          from: detectedEncoding || 'AUTO',
        });

        // Convert to string
        const text = Encoding.codeToString(unicodeArray);
        onFileLoaded(text);
      };

      reader.readAsArrayBuffer(file);
    },
    [onFileLoaded]
  );

  return {
    handleFileDrop,
  };
};
