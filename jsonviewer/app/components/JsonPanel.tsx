import { JsonEditor } from './JsonEditor';
import { DragOverlay } from './DragOverlay';

interface JsonPanelProps {
  jsonText: string;
  invalidLines: Set<number>;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
  fontFamily: string;
  fontSize: number;
  diffLines?: Set<number>;
  diffType?: 'left' | 'right';
  label?: string;
  className?: string;
}

export const JsonPanel = ({
  jsonText,
  invalidLines,
  onChange,
  getRootProps,
  getInputProps,
  isDragActive,
  fontFamily,
  fontSize,
  diffLines,
  diffType,
  label,
  className = '',
}: JsonPanelProps) => {
  return (
    <div
      {...getRootProps()}
      className={`flex-1 flex flex-col overflow-hidden relative ${
        isDragActive
          ? 'border-4 border-dashed border-blue-500 bg-blue-50'
          : ''
      } transition-all ${className}`}
    >
      <input {...getInputProps()} />

      <DragOverlay isActive={isDragActive} />

      {label && (
        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
          <span className="font-semibold text-sm text-gray-700">{label}</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <JsonEditor
          jsonText={jsonText}
          invalidLines={invalidLines}
          onChange={onChange}
          diffLines={diffLines}
          diffType={diffType}
          fontFamily={fontFamily}
          fontSize={fontSize}
        />
      </div>
    </div>
  );
};
