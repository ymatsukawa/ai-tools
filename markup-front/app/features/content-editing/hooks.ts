import { useState, useCallback } from 'react';
import { writeToFile } from '../file-operations/api';
import { createFileMessage, createAssistantMessage } from '../../entities/file/model';
import type { Message } from '../../shared/types/common';

export function useContentEditing(
  currentFileContent: string,
  fileHandle: any,
  currentFile: File | null,
  setCurrentFileContent: React.Dispatch<React.SetStateAction<string>>,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  const handleContentBlur = useCallback(async (): Promise<void> => {
    if (isEditing && editContent !== currentFileContent) {
      setCurrentFileContent(editContent);

      if (fileHandle && currentFile) {
        try {
          await writeToFile(fileHandle, editContent);

          setMessages([
            createFileMessage(currentFile.name),
            createAssistantMessage(editContent)
          ]);
        } catch (error) {
          console.error('Error saving file:', error);
        }
      }
    }
    setIsEditing(false);

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    });
  }, [isEditing, editContent, currentFileContent, fileHandle, currentFile, setCurrentFileContent, setMessages]);

  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setEditContent(event.target.value);
  }, []);

  return {
    isEditing,
    editContent,
    handleContentBlur,
    handleContentChange,
    setIsEditing,
    setEditContent
  };
}