import React, { useEffect, useRef } from 'react';

interface Snippet {
  label: string;
  content: string;
}

interface SnippetDropdownProps {
  snippets: Snippet[];
  selectedIndex: number;
  onSelect: (snippet: Snippet) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

export function SnippetDropdown({
  snippets,
  selectedIndex,
  onSelect,
  onClose,
  position
}: SnippetDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedItemRef.current && dropdownRef.current) {
      const dropdown = dropdownRef.current;
      const selectedItem = selectedItemRef.current;
      const dropdownRect = dropdown.getBoundingClientRect();
      const selectedRect = selectedItem.getBoundingClientRect();

      if (selectedRect.bottom > dropdownRect.bottom) {
        dropdown.scrollTop += selectedRect.bottom - dropdownRect.bottom;
      } else if (selectedRect.top < dropdownRect.top) {
        dropdown.scrollTop -= dropdownRect.top - selectedRect.top;
      }
    }
  }, [selectedIndex]);

  return (
    <div
      ref={dropdownRef}
      className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto min-w-48"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {snippets.map((snippet, index) => (
        <div
          key={index}
          ref={index === selectedIndex ? selectedItemRef : null}
          className={`px-4 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
            index === selectedIndex
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => onSelect(snippet)}
        >
          <div className="font-medium text-sm">{snippet.label}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
            {snippet.content.replace(/\n/g, '\\n')}
          </div>
        </div>
      ))}
    </div>
  );
}