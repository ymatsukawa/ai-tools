import { type ChangeEvent, useRef, useCallback, useLayoutEffect } from 'react';

interface JsonEditorProps {
  jsonText: string;
  invalidLines: Set<number>;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  diffLines?: Set<number>;
  diffType?: 'left' | 'right';
  fontFamily?: string;
  fontSize?: number;
}

export const JsonEditor = ({ jsonText, invalidLines, onChange, diffLines, diffType, fontFamily = 'monospace', fontSize = 15 }: JsonEditorProps) => {
  const lines = jsonText.split('\n');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumberRef = useRef<HTMLDivElement>(null);

  // Sync scroll between textarea, highlights, and line numbers
  const handleScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current && lineNumberRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      lineNumberRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  // Sync scroll when content changes (paste, drop, or edit)
  // Using useLayoutEffect to ensure sync happens before browser paint
  useLayoutEffect(() => {
    handleScroll();
  }, [jsonText, handleScroll]);

  // GitHub-style diff colors
  const getDiffBgClass = (lineIndex: number) => {
    if (invalidLines.has(lineIndex)) {
      return 'bg-red-100';
    }
    if (diffLines?.has(lineIndex + 1)) {
      return diffType === 'left' ? 'bg-red-50' : 'bg-green-50';
    }
    return '';
  };

  const getDiffLineNumberClass = (lineIndex: number) => {
    if (invalidLines.has(lineIndex)) {
      return 'bg-red-200 text-red-700';
    }
    if (diffLines?.has(lineIndex + 1)) {
      return diffType === 'left' ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700';
    }
    return '';
  };

  return (
    <div className="relative w-full flex-1 flex overflow-hidden">
      {/* Line numbers */}
      <div
        ref={lineNumberRef}
        className="bg-gray-100 px-2 py-3 text-right text-gray-500 select-none border-r border-gray-300 overflow-auto [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          fontFamily,
          fontSize: `${fontSize}px`,
        }}
      >
        {lines.map((_, index) => (
          <div
            key={index}
            className={`leading-6 ${getDiffLineNumberClass(index)}`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      {/* Code editor area with line highlighting */}
      <div className="flex-1 relative overflow-hidden h-full">
        {/* Background highlights for invalid and diff lines */}
        <div
          ref={highlightRef}
          className="absolute top-0 left-0 pointer-events-none overflow-auto [&::-webkit-scrollbar]:hidden"
          style={{
            width: '100%',
            height: '100%',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <div className="p-3 leading-6 whitespace-pre min-w-max" style={{ fontFamily, fontSize: `${fontSize}px` }}>
            {lines.map((line, index) => (
              <div
                key={index}
                className={getDiffBgClass(index)}
              >
                {line || ' '}
              </div>
            ))}
          </div>
        </div>

        {/* Text area */}
        <textarea
          ref={textareaRef}
          value={jsonText}
          onChange={onChange}
          onScroll={handleScroll}
          placeholder="Paste JSON here or drag and drop a JSON file..."
          className="absolute top-0 left-0 w-full h-full p-3 leading-6 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent overflow-auto whitespace-pre"
          style={{ whiteSpace: 'pre', fontFamily, fontSize: `${fontSize}px` }}
          spellCheck={false}
          wrap="off"
        />
      </div>
    </div>
  );
};
