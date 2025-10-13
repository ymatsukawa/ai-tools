import { useEffect, useRef, useCallback } from 'react';
import { logFileChange } from '../../shared/lib/utils';

export function useFilePolling(
  fileHandle: any,
  currentFileContent: string,
  lastModified: number,
  fileSize: number,
  onFileChange: (newContent: string, file: File) => void
) {
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const currentDelay = useRef<number>(1000); // Start with 1 second
  const maxDelay = useRef<number>(30000); // Max 30 seconds
  const isDocumentActive = useRef<boolean>(true);

  const checkFileChanges = useCallback(async () => {
    if (!fileHandle) return;
    
    try {
      const file = await fileHandle.getFile();
      
      // Quick check: only read content if metadata changed
      const timeChanged = file.lastModified > lastModified;
      const sizeChanged = file.size !== fileSize;
      
      if (timeChanged || sizeChanged) {
        const newContent = await file.text();
        const contentChanged = newContent !== currentFileContent;
        
        if (contentChanged) {
          // Reset to faster polling when changes detected
          currentDelay.current = 1000;
          
          logFileChange({
            timeChanged,
            sizeChanged,
            contentChanged,
            oldTime: new Date(lastModified),
            newTime: new Date(file.lastModified),
            oldSize: fileSize,
            newSize: file.size,
            oldLength: currentFileContent.length,
            newLength: newContent.length
          });
          
          onFileChange(newContent, file);
        }
      } else {
        // No changes, increase delay with exponential backoff
        currentDelay.current = Math.min(currentDelay.current * 1.5, maxDelay.current);
      }
    } catch (error) {
      console.error('Error checking file:', error);
      // Increase delay on error
      currentDelay.current = Math.min(currentDelay.current * 2, maxDelay.current);
    }
    
    // Schedule next check
    if (pollingInterval.current) clearTimeout(pollingInterval.current);
    const delay = isDocumentActive.current ? currentDelay.current : Math.min(currentDelay.current * 2, maxDelay.current);
    pollingInterval.current = setTimeout(checkFileChanges, delay);
  }, [fileHandle, lastModified, fileSize, currentFileContent, onFileChange]);

  const scheduleNextCheck = useCallback(() => {
    if (pollingInterval.current) clearTimeout(pollingInterval.current);
    
    const delay = isDocumentActive.current ? currentDelay.current : Math.min(currentDelay.current * 2, maxDelay.current);
    pollingInterval.current = setTimeout(checkFileChanges, delay);
  }, [checkFileChanges]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentActive.current = !document.hidden;
      if (!document.hidden && fileHandle) {
        // Reset delay when document becomes active
        currentDelay.current = 1000;
        scheduleNextCheck();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    if (fileHandle) {
      console.log('Starting intelligent file polling');
      currentDelay.current = 1000; // Reset delay
      scheduleNextCheck();
    } else {
      console.log('Stopping file polling');
    }
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (pollingInterval.current) {
        clearTimeout(pollingInterval.current);
        pollingInterval.current = null;
      }
    };
  }, [fileHandle, scheduleNextCheck]);

  useEffect(() => {
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);
}