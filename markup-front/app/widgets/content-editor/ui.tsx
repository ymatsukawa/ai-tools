import React, { useRef, useCallback } from 'react';
import { useSnippets } from '../../features/content-editing/useSnippets';
import { SnippetDropdown } from './SnippetDropdown';

interface ContentEditorProps {
  editContent: string;
  selectedFont: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ContentEditor({
  editContent,
  selectedFont,
  onChange,
  onBlur,
  onKeyDown
}: ContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    snippets,
    showSnippets,
    selectedSnippetIndex,
    snippetPosition,
    showSnippetDropdown,
    hideSnippetDropdown,
    navigateSnippets,
    getSelectedSnippet
  } = useSnippets();

  const getCursorPosition = useCallback(() => {
    // Center the modal in the viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = 240; // max-h-60 = 240px
    const dropdownWidth = 192; // min-w-48 = 192px
    
    const top = (viewportHeight - dropdownHeight) / 2;
    const left = (viewportWidth - dropdownWidth) / 2;

    return { top, left };
  }, []);

  const insertSnippet = useCallback((snippet: { content: string }) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = editContent.substring(0, start) + snippet.content + editContent.substring(end);

    const newEvent = {
      target: { value: newValue }
    } as React.ChangeEvent<HTMLTextAreaElement>;

    onChange(newEvent);
    hideSnippetDropdown();

    setTimeout(() => {
      const newCursorPos = start + snippet.content.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [editContent, onChange, hideSnippetDropdown]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSnippets) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          navigateSnippets('up');
          break;
        case 'ArrowDown':
          event.preventDefault();
          navigateSnippets('down');
          break;
        case 'Enter':
        case 'Tab':
          event.preventDefault();
          const selected = getSelectedSnippet();
          if (selected) {
            insertSnippet(selected);
          }
          break;
        case 'Escape':
          event.preventDefault();
          hideSnippetDropdown();
          break;
      }
      return;
    }

    if (event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      const position = getCursorPosition();
      showSnippetDropdown(position);
      return;
    }

    if (onKeyDown) {
      onKeyDown(event);
    }
  }, [showSnippets, navigateSnippets, getSelectedSnippet, insertSnippet, hideSnippetDropdown, getCursorPosition, showSnippetDropdown, onKeyDown]);

  const handleBlur = useCallback((event: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!event.relatedTarget?.closest('.snippet-dropdown')) {
      hideSnippetDropdown();
    }
    onBlur();
  }, [hideSnippetDropdown, onBlur]);

  return (
    <div className="flex-1 p-6 relative">
      <textarea
        ref={textareaRef}
        value={editContent}
        onChange={onChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full h-full resize-none border-none outline-none bg-white/60 dark:bg-gray-900/60 text-[#2c2c2c] dark:text-gray-100 rounded-lg px-6 py-4 shadow-sm"
        style={{
          fontFamily: selectedFont,
          paddingBottom: '50vh'
        }}
        autoFocus
      />

      {showSnippets && (
        <div className="snippet-dropdown">
          <SnippetDropdown
            snippets={snippets}
            selectedIndex={selectedSnippetIndex}
            onSelect={insertSnippet}
            onClose={hideSnippetDropdown}
            position={snippetPosition}
          />
        </div>
      )}
    </div>
  );
}
