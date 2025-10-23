interface DragOverlayProps {
  isActive: boolean;
}

export const DragOverlay = ({ isActive }: DragOverlayProps) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-20 pointer-events-none">
      <div className="text-center">
        <p className="text-lg font-semibold text-blue-600">
          Drop JSON file here
        </p>
      </div>
    </div>
  );
};
