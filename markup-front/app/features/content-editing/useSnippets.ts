import { useState, useEffect, useCallback } from 'react';

interface Snippet {
  label: string;
  content: string;
}

export function useSnippets() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [showSnippets, setShowSnippets] = useState(false);
  const [selectedSnippetIndex, setSelectedSnippetIndex] = useState(0);
  const [snippetPosition, setSnippetPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const loadSnippets = async () => {
      try {
        const response = await fetch('/snippets.json');
        if (response.ok) {
          const snippetsData = await response.json();
          setSnippets(snippetsData);
        }
      } catch (error) {
        console.error('Failed to load snippets:', error);
      }
    };

    loadSnippets();
  }, []);

  const showSnippetDropdown = useCallback((position: { top: number; left: number }) => {
    setSnippetPosition(position);
    setShowSnippets(true);
    setSelectedSnippetIndex(0);
  }, []);

  const hideSnippetDropdown = useCallback(() => {
    setShowSnippets(false);
    setSelectedSnippetIndex(0);
  }, []);

  const navigateSnippets = useCallback((direction: 'up' | 'down') => {
    if (!showSnippets || snippets.length === 0) return;

    setSelectedSnippetIndex(prev => {
      if (direction === 'up') {
        return prev > 0 ? prev - 1 : snippets.length - 1;
      } else {
        return prev < snippets.length - 1 ? prev + 1 : 0;
      }
    });
  }, [showSnippets, snippets.length]);

  const getSelectedSnippet = useCallback(() => {
    return snippets[selectedSnippetIndex] || null;
  }, [snippets, selectedSnippetIndex]);

  return {
    snippets,
    showSnippets,
    selectedSnippetIndex,
    snippetPosition,
    showSnippetDropdown,
    hideSnippetDropdown,
    navigateSnippets,
    getSelectedSnippet
  };
}