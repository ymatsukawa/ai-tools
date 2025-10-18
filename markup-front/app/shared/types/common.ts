export interface FontOption {
  name: string;
  value: string;
  displayName: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface FileState {
  currentFile: File | null;
  currentFileContent: string;
  fileHandle: any;
  lastModified: number;
  fileSize: number;
}