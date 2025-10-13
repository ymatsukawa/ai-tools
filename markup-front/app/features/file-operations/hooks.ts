import { useEffect } from 'react';
import { createFileMessage, createAssistantMessage } from '../../entities/file/model';
import { writeToFile, downloadFile, openFileWithSystemAPI, openImageDirectoryWithSystemAPI } from './api';
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
  const handleFileOpen = async (): Promise<void> => {
    try {
      const { handle, file, content } = await openFileWithSystemAPI();
      
      setFileHandle(handle);
      setCurrentFile(file);
      setCurrentFileContent(content);
      setLastModified(file.lastModified);
      setFileSize(file.size);
      setIsStreaming(true);
      setMessages([]);
      
      setMessages([
        createFileMessage(file.name),
        createAssistantMessage(content)
      ]);
      setIsStreaming(false);
    } catch (error) {
      console.error('File open error:', error);
    }
  };

  const handleSendMessage = async (inputValue: string): Promise<void> => {
    if (!inputValue.trim() || !currentFile) return;

    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    
    const newContent = currentFileContent + '\n\n' + inputValue;
    setCurrentFileContent(newContent);

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
  };

  return { handleFileOpen, handleSendMessage };
}

export function useImageDirectoryOperations(
  setImageDirectoryHandle: React.Dispatch<React.SetStateAction<any>>,
  setBackgroundImages: React.Dispatch<React.SetStateAction<string[]>>,
  setCurrentBackgroundIndex: React.Dispatch<React.SetStateAction<number>>
) {
  const handleImageDirectoryOpen = async (): Promise<void> => {
    try {
      const handle = await openImageDirectoryWithSystemAPI();
      setImageDirectoryHandle(handle);
    } catch (error) {
      console.error('Image directory open error:', error);
    }
  };

  const loadImagesFromDirectory = async (imageDirectoryHandle: any) => {
    if (!imageDirectoryHandle) return;
    
    try {
      const imageFiles: { name: string; handle: any }[] = [];
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      
      // First, collect all image file handles
      for await (const [name, handle] of imageDirectoryHandle.entries()) {
        if (handle.kind === 'file') {
          const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
          if (imageExtensions.includes(extension)) {
            imageFiles.push({ name, handle });
          }
        }
      }
      
      // Lazy loading: Create URLs only for the first few images
      const INITIAL_LOAD_COUNT = 3;
      const imageUrls: string[] = [];
      
      for (let i = 0; i < Math.min(INITIAL_LOAD_COUNT, imageFiles.length); i++) {
        const file = await imageFiles[i].handle.getFile();
        const url = URL.createObjectURL(file);
        imageUrls.push(url);
      }
      
      // Store remaining handles for lazy loading
      const remainingHandles = imageFiles.slice(INITIAL_LOAD_COUNT).map(f => f.handle);
      
      setBackgroundImages(imageUrls);
      if (imageUrls.length > 0) {
        setCurrentBackgroundIndex(0);
      }
      
      // Lazy load remaining images in background
      if (remainingHandles.length > 0) {
        setTimeout(async () => {
          const additionalUrls: string[] = [];
          
          for (const handle of remainingHandles) {
            try {
              const file = await handle.getFile();
              const url = URL.createObjectURL(file);
              additionalUrls.push(url);
            } catch (error) {
              console.warn('Failed to load image:', error);
            }
          }
          
          if (additionalUrls.length > 0) {
            setBackgroundImages(prev => [...prev, ...additionalUrls]);
          }
        }, 500); // Load after 500ms
      }
    } catch (error) {
      console.error('Error loading images from directory:', error);
    }
  };

  return { handleImageDirectoryOpen, loadImagesFromDirectory };
}