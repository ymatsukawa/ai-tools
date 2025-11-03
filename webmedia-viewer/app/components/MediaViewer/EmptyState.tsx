export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-2xl mx-auto">
      <svg
        className="w-16 h-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        No Media Loaded
      </h2>
      <p className="text-gray-500 mb-4">
        Click "Select Directory" to choose a folder with media files
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-left">
        <div className="flex items-start gap-2">
          <svg
            className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">
              About Browser Permission
            </p>
            <p className="text-blue-800">
              Your browser will ask for permission to access your
              files. This is a security feature to protect your
              privacy. You'll need to grant permission each time you
              select a directory.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
