import { useDropzone } from 'react-dropzone';
import { useFileUpload } from './useFileUpload';

interface UseJsonDropzoneProps {
  onFileLoaded: (content: string) => void;
}

export const useJsonDropzone = ({ onFileLoaded }: UseJsonDropzoneProps) => {
  const { handleFileDrop } = useFileUpload({ onFileLoaded });

  const dropzoneConfig = useDropzone({
    onDrop: handleFileDrop,
    accept: {
      'application/json': ['.json'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    noClick: true,
    noKeyboard: true,
  });

  return dropzoneConfig;
};
