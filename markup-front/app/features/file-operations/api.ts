export const writeToFile = async (fileHandle: any, content: string): Promise<void> => {
  if (!fileHandle || !('createWritable' in fileHandle)) {
    throw new Error('File System Access API not available');
  }
  
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
};

export const downloadFile = (content: string, fileName: string): void => {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const openFileWithSystemAPI = async (): Promise<{ handle: any, file: File, content: string }> => {
  const [handle] = await (window as any).showOpenFilePicker({
    types: [{
      description: 'Markdown files',
      accept: { 'text/markdown': ['.md'] }
    }],
    multiple: false
  });

  const file = await handle.getFile();
  const content = await file.text();

  return { handle, file, content };
};