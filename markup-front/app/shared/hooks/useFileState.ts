import { useReducer, useCallback } from 'react';
import type { Message } from '../types/common';

interface FileState {
  messages: Message[];
  inputValue: string;
  isStreaming: boolean;
  currentFile: File | null;
  currentFileContent: string;
  fileHandle: any;
  lastModified: number;
  fileSize: number;
}

type FileAction =
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_INPUT_VALUE'; payload: string }
  | { type: 'SET_IS_STREAMING'; payload: boolean }
  | { type: 'SET_FILE'; payload: { file: File; content: string; handle: any } }
  | { type: 'SET_FILE_CONTENT'; payload: string }
  | { type: 'UPDATE_FILE_METADATA'; payload: { lastModified: number; fileSize: number } }
  | { type: 'RESET_FILE' };

const initialState: FileState = {
  messages: [],
  inputValue: '',
  isStreaming: false,
  currentFile: null,
  currentFileContent: '',
  fileHandle: null,
  lastModified: 0,
  fileSize: 0,
};

function fileReducer(state: FileState, action: FileAction): FileState {
  switch (action.type) {
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_INPUT_VALUE':
      return { ...state, inputValue: action.payload };
    case 'SET_IS_STREAMING':
      return { ...state, isStreaming: action.payload };
    case 'SET_FILE':
      return {
        ...state,
        currentFile: action.payload.file,
        currentFileContent: action.payload.content,
        fileHandle: action.payload.handle,
        lastModified: action.payload.file.lastModified,
        fileSize: action.payload.file.size,
      };
    case 'SET_FILE_CONTENT':
      return { ...state, currentFileContent: action.payload };
    case 'UPDATE_FILE_METADATA':
      return {
        ...state,
        lastModified: action.payload.lastModified,
        fileSize: action.payload.fileSize,
      };
    case 'RESET_FILE':
      return {
        ...state,
        currentFile: null,
        currentFileContent: '',
        fileHandle: null,
        lastModified: 0,
        fileSize: 0,
      };
    default:
      return state;
  }
}

export function useFileState() {
  const [state, dispatch] = useReducer(fileReducer, initialState);

  const setMessages = useCallback((messages: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof messages === 'function') {
      dispatch({ type: 'SET_MESSAGES', payload: messages(state.messages) });
    } else {
      dispatch({ type: 'SET_MESSAGES', payload: messages });
    }
  }, [state.messages]);

  const setInputValue = useCallback((value: string) => {
    dispatch({ type: 'SET_INPUT_VALUE', payload: value });
  }, []);

  const setIsStreaming = useCallback((isStreaming: boolean) => {
    dispatch({ type: 'SET_IS_STREAMING', payload: isStreaming });
  }, []);

  const setFile = useCallback((file: File, content: string, handle: any) => {
    dispatch({ type: 'SET_FILE', payload: { file, content, handle } });
  }, []);

  const setCurrentFileContent = useCallback((content: string) => {
    dispatch({ type: 'SET_FILE_CONTENT', payload: content });
  }, []);

  const updateFileMetadata = useCallback((lastModified: number, fileSize: number) => {
    dispatch({ type: 'UPDATE_FILE_METADATA', payload: { lastModified, fileSize } });
  }, []);

  return {
    state,
    setMessages,
    setInputValue,
    setIsStreaming,
    setFile,
    setCurrentFileContent,
    updateFileMetadata,
  };
}
