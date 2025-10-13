import type { Message } from '../../shared/types/common';

const CHUNK_SIZE = 15; // Characters per batch
const STREAMING_DELAY = 8; // ms per chunk

export async function streamContentToMessages(
  content: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  initialMessage: Message,
  useStreaming: boolean = true
) {
  let currentMessage = { ...initialMessage, content };
  
  if (!useStreaming) {
    setMessages(prev => [...prev, currentMessage]);
    return;
  }
  
  // Create chunks of characters for batched updates
  const chunks: string[] = [];
  for (let i = 0; i < content.length; i += CHUNK_SIZE) {
    chunks.push(content.slice(i, i + CHUNK_SIZE));
  }
  
  let streamedContent = '';
  currentMessage = { ...initialMessage };
  
  setMessages(prev => [...prev, currentMessage]);
  
  // Use requestAnimationFrame for smooth updates
  for (let i = 0; i < chunks.length; i++) {
    streamedContent += chunks[i];
    
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            ...initialMessage, 
            content: streamedContent 
          };
          return newMessages;
        });
        
        setTimeout(resolve, STREAMING_DELAY);
      });
    });
  }
}

// Utility function to create a cancellable streaming operation
export function createCancellableStream(
  content: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  initialMessage: Message
) {
  let cancelled = false;
  
  const stream = async () => {
    const chunks: string[] = [];
    for (let i = 0; i < content.length; i += CHUNK_SIZE) {
      chunks.push(content.slice(i, i + CHUNK_SIZE));
    }
    
    let streamedContent = '';
    setMessages(prev => [...prev, { ...initialMessage }]);
    
    for (let i = 0; i < chunks.length && !cancelled; i++) {
      streamedContent += chunks[i];
      
      await new Promise<void>(resolve => {
        if (cancelled) {
          resolve();
          return;
        }
        
        requestAnimationFrame(() => {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { 
              ...initialMessage, 
              content: streamedContent 
            };
            return newMessages;
          });
          
          setTimeout(resolve, STREAMING_DELAY);
        });
      });
    }
  };
  
  const cancel = () => {
    cancelled = true;
  };
  
  return { stream, cancel };
}