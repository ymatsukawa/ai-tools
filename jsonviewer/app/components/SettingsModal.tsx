interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFont: string;
  onFontChange: (font: string) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

const CODING_FONTS = [
  { name: 'JetBrains Mono', value: 'JetBrains Mono', description: 'Modern with ligatures' },
  { name: 'Source Code Pro', value: 'Source Code Pro', description: 'Clean Adobe design' },
  { name: 'Courier New', value: 'Courier New', description: 'Classic monospace' },
];

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 30;

export const SettingsModal = ({ isOpen, onClose, selectedFont, onFontChange, fontSize, onFontSizeChange }: SettingsModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Editor Font
            </label>
            <select
              value={selectedFont}
              onChange={(e) => onFontChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ fontFamily: selectedFont }}
            >
              {CODING_FONTS.map((font) => (
                <option
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.name} — {font.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Font Size
              </label>
              <span className="text-sm font-medium text-gray-600">{fontSize}px</span>
            </div>
            <input
              type="range"
              min={MIN_FONT_SIZE}
              max={MAX_FONT_SIZE}
              value={fontSize}
              onChange={(e) => onFontSizeChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{MIN_FONT_SIZE}px</span>
              <span>{MAX_FONT_SIZE}px</span>
            </div>
          </div>

          <div className="mt-6 p-3 bg-gray-100 rounded border border-gray-300">
            <p className="text-sm text-gray-600 mb-2">Preview:</p>
            <code
              className="block leading-relaxed"
              style={{ fontFamily: selectedFont, fontSize: `${fontSize}px` }}
            >
              {`const hello = "Hello 世界";`}
            </code>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
