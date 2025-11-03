import { memo } from "react";
import type { MediaFile } from "../../types/mediaViewer";
import { MediaTile } from "./MediaTile";

interface MediaGridProps {
  medias: MediaFile[];
  onMediaClick: (index: number) => void;
}

const MediaGridComponent = ({
  medias,
  onMediaClick
}: MediaGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {medias.map((media, index) => (
        <MediaTile
          key={media.url}
          media={media}
          index={index}
          onClick={onMediaClick}
        />
      ))}
    </div>
  );
};

export const MediaGrid = memo(MediaGridComponent);
