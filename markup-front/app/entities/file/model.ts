import type { Message } from '../../shared/types/common';

export const createFileMessage = (fileName: string): Message => ({
  role: 'user',
  content: `File: ${fileName}`
});

export const createAssistantMessage = (content: string): Message => ({
  role: 'assistant',
  content
});