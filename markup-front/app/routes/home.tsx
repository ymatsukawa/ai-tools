import type { Route } from "./+types/home";
import { useState, useEffect, useCallback } from "react";
import { Messages } from "../components/home/Messages";
import { SettingsModal } from "../components/home/SettingsModal";

// FSD imports
import { fontOptions } from "../shared/config/fonts";
import type { Message, FileState } from "../shared/types/common";
import { useDebounce, useThrottle } from "../shared/hooks/debounce";
import { useFilePolling } from "../entities/file/hooks";
import { createFileMessage, createAssistantMessage } from "../entities/file/model";
import { useFileOperations } from "../features/file-operations/hooks";
import { useContentEditing } from "../features/content-editing/hooks";
import { useSettings } from "../features/settings/hooks";
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

  useFilePolling(
    fileHandle,
    currentFileContent,
    lastModified,
    fileSize,
    handleFileContentChange
  );

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
    if (event.ctrlKey && event.key === 'j') {
      event.preventDefault();
      scrollToBottom();
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (isEditing) {
        handleContentBlur();
      }
    }
  }, [scrollToBottom, isEditing, handleContentBlur]);

  // Handle keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="h-screen bg-[#faf9f7] dark:bg-[#2d2d2d] flex relative">
      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto relative z-20">
        {/* Header with controls */}
        <div className="bg-[#faf9f7]/90 dark:bg-[#2d2d2d]/90 border-b border-[#e8e6e3] dark:border-[#484848] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[#2c2c2c] dark:text-gray-100">MDaude</h1>
            {currentFile && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#424242] rounded-lg border border-[#e8e6e3] dark:border-[#484848]">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-[#4a4a4a] dark:text-gray-300">{currentFile.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFileOpen}
              className="px-4 py-2 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors flex items-center gap-2"
              title="Open File"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Open File</span>
            </button>

            <button
              onClick={handleSettingsOpen}
              className="p-2 hover:bg-[#f0efed] dark:hover:bg-[#3a3a3a] rounded-lg transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5 text-[#4a4a4a] dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
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
          <div>
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
