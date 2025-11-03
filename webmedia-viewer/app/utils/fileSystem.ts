import type { MediaFile } from "../types/mediaViewer";

export const isFileSystemSupported = (): boolean => {
  return 'showDirectoryPicker' in window;
};

export const selectDirectory = async (): Promise<FileSystemDirectoryHandle> => {
  if (!isFileSystemSupported()) {
    throw new Error(
      'File System Access API is not supported. ' +
      'Please use Chrome or Edge.'
    );
  }

  // @ts-expect-error - showDirectoryPicker not in TS types yet
  return await window.showDirectoryPicker();
};

export const loadImagesFromDirectory = async (
  directoryHandle: FileSystemDirectoryHandle,
  onProgress?: (progress: number) => void
): Promise<MediaFile[]> => {
  const mediaFiles: MediaFile[] = [];
  const entries: FileSystemFileHandle[] = [];

  // @ts-expect-error - values() not in TS types yet
  for await (const entry of directoryHandle.values()) {
    if (entry.kind === 'file') {
      entries.push(entry as FileSystemFileHandle);
    }
  }

  let processed = 0;
  for (const fileHandle of entries) {
    const file = await fileHandle.getFile();

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      mediaFiles.push({ name: file.name, url, file, type: 'image' });
    } else if (file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      mediaFiles.push({ name: file.name, url, file, type: 'video' });
    }

    processed++;
    if (onProgress) {
      onProgress(Math.round((processed / entries.length) * 100));
    }
  }

  return mediaFiles;
};
