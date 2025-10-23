interface ButtonBarProps {
  onFormat: () => void;
  onCopy: () => void;
  onSelectFile: () => void;
  onDiff: () => void;
  onSettings: () => void;
  isDiffMode: boolean;
  showInvalidLabel: boolean;
}

export const ButtonBar = ({
  onFormat,
  onCopy,
  onSelectFile,
  onDiff,
  onSettings,
  isDiffMode,
  showInvalidLabel,
}: ButtonBarProps) => {
  return (
    <div className="bg-gray-100 p-4 border-b border-gray-300 flex gap-3 items-center">
      <button
        onClick={onFormat}
        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-medium"
      >
        Format
      </button>
      <button
        onClick={onCopy}
        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-medium"
      >
        {isDiffMode ? 'Copy Left' : 'Copy'}
      </button>
      <button
        onClick={onSelectFile}
        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-medium"
      >
        Select File
      </button>
      <button
        onClick={onDiff}
        className={`px-4 py-2 rounded transition-colors font-medium ${
          isDiffMode
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-400 text-white hover:bg-gray-500'
        }`}
      >
        Diff
      </button>
      {showInvalidLabel && (
        <span className="text-red-600 font-semibold text-sm">
          Invalid Format
        </span>
      )}

      {/* Settings button on the right */}
      <button
        onClick={onSettings}
        className="ml-auto p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
        title="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  );
};
