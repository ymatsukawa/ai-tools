import { useState, useEffect } from "react";
import type { MediaFile } from "../types/mediaViewer";
import {
  selectDirectory,
  loadImagesFromDirectory,
} from "../utils/fileSystem";

export const useMediaLoader = () => {
  const [medias, setMedias] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [directoryName, setDirectoryName] = useState<string | null>(
    null
  );

  useEffect(() => {
    return () => {
      medias.forEach(media => URL.revokeObjectURL(media.url));
    };
  }, [medias]);

  const handleSelectDirectory = async () => {
    try {
      setError(null);
      setLoading(true);
      setProgress(0);

      const dirHandle = await selectDirectory();
      setDirectoryName(dirHandle.name);

      const mediaFiles = await loadImagesFromDirectory(
        dirHandle,
        setProgress
      );

      setMedias(mediaFiles);
      setLoading(false);
    } catch (err) {
      console.error('Error selecting directory:', err);
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Directory selection was cancelled.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load media from directory.');
      }
      setLoading(false);
    }
  };

  return {
    medias,
    loading,
    progress,
    error,
    directoryName,
    handleSelectDirectory,
  };
};
