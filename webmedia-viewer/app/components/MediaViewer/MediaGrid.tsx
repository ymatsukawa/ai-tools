import type { MediaFile } from "../../types/mediaViewer";
import { VideoIcon } from "./VideoIcon";

interface MediaGridProps {
  medias: MediaFile[];
  onMediaClick: (index: number) => void;
}

export const MediaGrid = ({ medias, onMediaClick }: MediaGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {medias.map((media, index) => (
        <div
          key={media.url}
          onClick={() => onMediaClick(index)}
          className="relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer hover:ring-4 hover:ring-blue-400 transition-all shadow-md hover:shadow-xl"
        >
          {media.type === 'video' ? (
            <>
              <video
                src={media.url}
                className="w-full h-full object-cover"
                preload="metadata"
              />
              <VideoIcon />
            </>
          ) : (
            <img
              src={media.url}
              alt={media.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  );
};
