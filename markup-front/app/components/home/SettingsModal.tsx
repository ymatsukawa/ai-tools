import type { FontOption } from "./types";

interface SettingsModalProps {
  showSettings: boolean;
  selectedFont: string;
  fontOptions: FontOption[];
  onClose: () => void;
  onFontChange: (font: string) => void;
}

export function SettingsModal({ 
  showSettings, 
  selectedFont, 
  fontOptions, 
  onClose, 
  onFontChange 
}: SettingsModalProps) {
  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Font Selection</h3>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {fontOptions.map((font) => (
                <label
                  key={font.name}
                  className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="font"
                    value={font.value}
                    checked={selectedFont === font.value}
                    onChange={() => onFontChange(font.value)}
                    className="mr-3"
                  />
                  <span 
                    className="text-sm"
                    style={{ fontFamily: font.value }}
                  >
                    {font.displayName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}