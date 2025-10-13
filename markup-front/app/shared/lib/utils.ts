export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const saveSelectedFont = (font: string): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('mdaude-selected-font', font);
    }
  } catch (error) {
    console.warn('Failed to save font to localStorage:', error);
  }
};

export const loadSelectedFont = (): string => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const savedFont = localStorage.getItem('mdaude-selected-font');
      return savedFont || "Inter";
    }
    return "Inter";
  } catch (error) {
    console.warn('Failed to load font from localStorage:', error);
    return "Inter";
  }
};

export const logFileChange = (changeInfo: {
  timeChanged: boolean;
  sizeChanged: boolean;
  contentChanged: boolean;
  oldTime: Date;
  newTime: Date;
  oldSize: number;
  newSize: number;
  oldLength: number;
  newLength: number;
}) => {
  console.log('File change detected:', changeInfo);
};