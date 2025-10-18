import { useCallback } from 'react';
import { createFileMessage, createAssistantMessage } from '../../entities/file/model';
import { writeToFile, downloadFile, openFileWithSystemAPI } from './api';
import type { Message } from '../../shared/types/common';

export function useFileOperations(
  fileHandle: any,
  currentFile: File | null,
  currentFileContent: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setCurrentFile: React.Dispatch<React.SetStateAction<File | null>>,
  setCurrentFileContent: React.Dispatch<React.SetStateAction<string>>,
  setFileHandle: React.Dispatch<React.SetStateAction<any>>,
  setLastModified: React.Dispatch<React.SetStateAction<number>>,
  setFileSize: React.Dispatch<React.SetStateAction<number>>,
  setIsStreaming: React.Dispatch<React.SetStateAction<boolean>>
) {
  const handleFileOpen = useCallback(async (): Promise<void> => {
    try {
      const { handle, file, content } = await openFileWithSystemAPI();

      setFileHandle(handle);
      setCurrentFile(file);
      setCurrentFileContent(content);
      setLastModified(file.lastModified);
      setFileSize(file.size);
      setIsStreaming(true);

      // Batch state updates together
      setMessages([
        createFileMessage(file.name),
        createAssistantMessage(content)
      ]);
      setIsStreaming(false);
    } catch (error) {
      console.error('File open error:', error);
    }
  }, [setFileHandle, setCurrentFile, setCurrentFileContent, setLastModified, setFileSize, setIsStreaming, setMessages]);

  const handleSendMessage = useCallback(async (inputValue: string): Promise<void> => {
    if (!inputValue.trim() || !currentFile) return;

    const newContent = currentFileContent + '\n\n' + inputValue;

    // Batch content and state updates
    setCurrentFileContent(newContent);
    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);

    try {
      if (fileHandle && 'createWritable' in fileHandle) {
        await writeToFile(fileHandle, newContent);

        const file = await fileHandle.getFile();
        setLastModified(file.lastModified);

        setMessages([
          createFileMessage(currentFile.name),
          createAssistantMessage(newContent)
        ]);
      } else {
        downloadFile(newContent, currentFile.name);

        setMessages(prev => [...prev,
          createAssistantMessage(
            `Downloaded updated ${currentFile.name} (browser doesn't support direct file updates)`
          )
        ]);
      }
    } catch (error) {
      setMessages(prev => [...prev,
        createAssistantMessage(`Error updating file: ${error}`)
      ]);
    }
  }, [currentFile, currentFileContent, fileHandle, setCurrentFileContent, setMessages, setLastModified]);

  return { handleFileOpen, handleSendMessage };
}