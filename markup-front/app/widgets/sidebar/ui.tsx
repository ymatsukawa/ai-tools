import React from 'react';

interface SidebarProps {
  sidebarVisible: boolean;
  currentFile: File | null;
  onFileOpen: () => void;
  onSettingsOpen: () => void;
}

export function Sidebar({
  sidebarVisible,
  currentFile,
  onFileOpen,
  onSettingsOpen
}: SidebarProps) {
  return (
    <div className={`${sidebarVisible ? 'w-[240px]' : 'w-0'} bg-[#f3f2f0]/90 dark:bg-[#363636]/90 border-r border-[#e8e6e3] dark:border-[#484848] flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative z-20`}>
      <div className="p-4 border-b border-[#e8e6e3] dark:border-[#484848]">
        <h1 className="text-lg font-semibold text-[#2c2c2c] dark:text-gray-100">MDaude</h1>
      </div>
      
      <div className="flex-1 p-4 space-y-3">
        {currentFile ? (
          <div className="p-3 bg-white dark:bg-[#424242] rounded-lg border border-[#e8e6e3] dark:border-[#484848]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-[#4a4a4a] dark:text-gray-300 truncate">{currentFile.name}</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-[#9b9b9b] dark:text-gray-400 text-center py-4">
            No file open
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-[#e8e6e3] dark:border-[#484848] space-y-2">
        <button
          onClick={onFileOpen}
          className="w-full px-4 py-2 bg-[#2c2c2c] text-white rounded-lg hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Open File
        </button>

        <button 
          onClick={onSettingsOpen}
          className="w-full px-4 py-2 bg-white dark:bg-[#424242] border border-[#e8e6e3] dark:border-[#484848] rounded-lg hover:bg-[#f8f7f6] dark:hover:bg-[#4a4a4a] transition-colors flex items-center justify-center gap-2 text-[#2c2c2c] dark:text-gray-100" 
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>
    </div>
  );
}