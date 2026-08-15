export interface FontOption {
  name: string;
  /** Identity key: persisted to localStorage and used for font URL lookup. */
  value: string;
  displayName: string;
  /** Full CSS font-family stack used for rendering, including system fallbacks. */
  stack: string;
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