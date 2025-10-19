import { useDropzone } from "react-dropzone";

interface CsvDropZoneProps {
  onFileAccepted: (file: File) => void;
  onFileRejected: () => void;
}

export function CsvDropZone({ onFileAccepted, onFileRejected }: CsvDropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    onDropRejected: onFileRejected,
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-lg text-gray-600">Drop the CSV file here ...</p>
      ) : (
        <p className="text-lg text-gray-600">Drag and drop a CSV file here, or click to select a file</p>
      )}
    </div>
  );
}
