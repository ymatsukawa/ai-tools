import type { Route } from "./+types/home";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Messages } from "../components/home/Messages";
import { SettingsModal } from "../components/home/SettingsModal";

// FSD imports
import { fontOptions } from "../shared/config/fonts";
import type { Message, FileState, BackgroundState } from "../shared/types/common";
import { useDebounce, useThrottle } from "../shared/hooks/debounce";
import { useFilePolling } from "../entities/file/hooks";
import { createFileMessage, createAssistantMessage } from "../entities/file/model";
import { useBackgroundRotation, useImagePreloader, useImageCleanup } from "../entities/background/hooks";
import { useFileOperations, useImageDirectoryOperations } from "../features/file-operations/hooks";
import { useContentEditing } from "../features/content-editing/hooks";
import { useSettings } from "../features/settings/hooks";
import { Sidebar } from "../widgets/sidebar/ui";
import { Background } from "../widgets/background/ui";
import { ContentEditor } from "../widgets/content-editor/ui";


export function meta({ }: Route.MetaArgs) {
  return [
    { title: "MDaude" },
    { name: "description", content: "A markdown reader with streaming display" },
  ];
}

export default function Home() {
  // UI State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Background State
  const [backgroundImages, setBackgroundImages] = useState<string[]>([]);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [imageDirectoryHandle, setImageDirectoryHandle] = useState<any>(null);

  // File State
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentFileContent, setCurrentFileContent] = useState<string>("");
  const [fileHandle, setFileHandle] = useState<any>(null);
  const [lastModified, setLastModified] = useState<number>(0);
  const [fileSize, setFileSize] = useState<number>(0);

  // Feature hooks
  const { showSettings, selectedFont, handleSettingsClose, handleSettingsOpen, handleFontChange } = useSettings();

  const {
    isEditing,
    editContent,
    handleContentClick,
    handleContentBlur,
    handleContentChange,
    setIsEditing,
    setEditContent
  } = useContentEditing(
    currentFileContent,
    fileHandle,
    currentFile,
    setCurrentFileContent,
    setMessages
  );

  // Debounce file content updates to prevent excessive re-renders
  const handleFileContentChange = useDebounce(
    useCallback((newContent: string, file: File) => {
      setCurrentFileContent(newContent);
      setLastModified(file.lastModified);
      setFileSize(file.size);

      setMessages([
        createFileMessage(file.name),
        createAssistantMessage(newContent)
      ]);
    }, [])
    , 300);

  const { handleFileOpen, handleSendMessage } = useFileOperations(
    fileHandle,
    currentFile,
    currentFileContent,
    setMessages,
    setCurrentFile,
    setCurrentFileContent,
    setFileHandle,
    setLastModified,
    setFileSize,
    setIsStreaming
  );

  const { handleImageDirectoryOpen, loadImagesFromDirectory } = useImageDirectoryOperations(
    setImageDirectoryHandle,
    setBackgroundImages,
    setCurrentBackgroundIndex
  );

  useEffect(() => {
    loadImagesFromDirectory(imageDirectoryHandle);
  }, [imageDirectoryHandle]);

  useBackgroundRotation(backgroundImages, setCurrentBackgroundIndex);
  useImagePreloader(backgroundImages, currentBackgroundIndex);
  useImageCleanup(backgroundImages);

  useFilePolling(
    fileHandle,
    currentFileContent,
    lastModified,
    fileSize,
    handleFileContentChange
  );

  const toggleSidebar = useCallback((): void => {
    setSidebarVisible(prev => !prev);
  }, []);

  const handleInputSend = useCallback(async (): Promise<void> => {
    await handleSendMessage(inputValue);
    setInputValue('');
  }, [handleSendMessage, inputValue]);

  // Throttle scroll operations for better performance
  const scrollToBottom = useThrottle(
    useCallback(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, []),
    100
  );

  // Memoize keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'n') {
      event.preventDefault();
      toggleSidebar();
    }
    if (event.ctrlKey && event.key === 'j') {
      event.preventDefault();
      scrollToBottom();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (isEditing) {
        handleContentBlur();
      } else if (currentFileContent) {
        setIsEditing(true);
        setEditContent(currentFileContent);
        setTimeout(() => {
          window.scrollTo({
            top: document.body.scrollHeight
          });
        }, 0);
      }
    }
  }, [toggleSidebar, scrollToBottom, isEditing, handleContentBlur, currentFileContent, setIsEditing, setEditContent]);

  // Handle keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Memoize current background image to prevent unnecessary re-renders
  const currentBackgroundImage = useMemo(() =>
    backgroundImages[currentBackgroundIndex],
    [backgroundImages, currentBackgroundIndex]
  );

  return (
    <div className="h-screen bg-[#faf9f7] dark:bg-[#2d2d2d] flex relative">
      <Background currentBackgroundImage={currentBackgroundImage} />

      <Sidebar
        sidebarVisible={sidebarVisible}
        currentFile={currentFile}
        imageDirectoryHandle={imageDirectoryHandle}
        backgroundImages={backgroundImages}
        onFileOpen={handleFileOpen}
        onImageDirectoryOpen={handleImageDirectoryOpen}
        onSettingsOpen={handleSettingsOpen}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!sidebarVisible ? 'max-w-4xl mx-auto' : ''} relative z-20`}>
        {/* Header with sidebar toggle */}
        <div className="bg-[#faf9f7]/90 dark:bg-[#2d2d2d]/90 border-b border-[#e8e6e3] dark:border-[#484848] px-4 py-3 flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-[#f0efed] dark:hover:bg-[#3a3a3a] rounded-lg transition-colors"
            title="Toggle sidebar"
          >
            <svg className="w-5 h-5 text-[#4a4a4a] dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isEditing ? (
          <ContentEditor
            editContent={editContent}
            selectedFont={selectedFont}
            onChange={handleContentChange}
            onBlur={handleContentBlur}
            onKeyDown={(event) => {
              if (event.ctrlKey && event.key === 'j') {
                event.preventDefault();
                const textarea = event.target as HTMLTextAreaElement;
                textarea.selectionStart = textarea.selectionEnd = textarea.value.length;
                textarea.scrollTop = textarea.scrollHeight;
              }
            }}
          />
        ) : (
          <div onClick={handleContentClick} className="cursor-text">
            <Messages
              messages={messages}
              selectedFont={selectedFont}
            />
            <div style={{ height: '33vh' }} />
          </div>
        )}

      </div>

      <SettingsModal
        showSettings={showSettings}
        selectedFont={selectedFont}
        fontOptions={fontOptions}
        onClose={handleSettingsClose}
        onFontChange={handleFontChange}
      />
    </div>
  );
}
