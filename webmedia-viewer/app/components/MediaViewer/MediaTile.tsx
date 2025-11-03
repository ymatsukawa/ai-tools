import { memo } from "react";
import type { MediaFile } from "../../types/mediaViewer";
import { VideoIcon } from "./VideoIcon";

interface MediaTileProps {
  media: MediaFile;
  index: number;
  onClick: (index: number) => void;
}

const MediaTileComponent = ({
  media,
  index,
  onClick
}: MediaTileProps) => {
  return (
    <div
      onClick={() => onClick(index)}
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
  );
};

export const MediaTile = memo(MediaTileComponent);
