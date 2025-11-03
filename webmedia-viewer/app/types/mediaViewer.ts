export interface MediaFile {
  name: string;
  url: string;
  file: File;
  type: 'image' | 'video';
}

export interface Settings {
  showTitle: boolean;
  showCounter: boolean;
}
