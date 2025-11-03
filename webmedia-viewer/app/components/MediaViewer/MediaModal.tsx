import { memo } from "react";
import type { MediaFile, Settings } from "../../types/mediaViewer";
import { NavigationButton } from "./NavigationButton";

interface MediaModalProps {
  media: MediaFile;
  currentIndex: number;
  totalMedia: number;
  settings: Settings;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const MediaModalComponent = ({
  media,
  currentIndex,
  totalMedia,
  settings,
  onClose,
  onPrevious,
  onNext,
}: MediaModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
        onClick={onClose}
        title="Close (Esc)"
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <NavigationButton direction="prev" onClick={onPrevious} />
      <NavigationButton direction="next" onClick={onNext} />

      <div
        className="max-w-[95vw] max-h-[95vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {media.type === 'video' ? (
          <video
            src={media.url}
            className="max-w-full max-h-[85vh] object-contain"
            controls
            autoPlay
          />
        ) : (
          <img
            src={media.url}
            alt={media.name}
            className="max-w-full max-h-[85vh] object-contain cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            title="Click to view next media"
          />
        )}
        {(settings.showTitle || settings.showCounter) && (
          <div className="mt-4 bg-black bg-opacity-75 px-6 py-3 rounded-lg pointer-events-none">
            {settings.showTitle && (
              <p className="text-white text-sm">{media.name}</p>
            )}
            {settings.showCounter && (
              <p
                className={`text-gray-400 text-xs text-center ${
                  settings.showTitle ? 'mt-1' : ''
                }`}
              >
                {currentIndex + 1} / {totalMedia}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const MediaModal = memo(MediaModalComponent);
