import { useMediaLoader } from "../../hooks/useMediaLoader";
import { useMediaNavigation } from "../../hooks/useMediaNavigation";
import { useKeyboardNavigation } from "../../hooks/useKeyboardNavigation";
import { useSettings } from "../../hooks/useSettings";
import { TopBar } from "./TopBar";
import { ErrorMessage } from "./ErrorMessage";
import { EmptyState } from "./EmptyState";
import { MediaGrid } from "./MediaGrid";
import { MediaModal } from "./MediaModal";

export function MediaViewer() {
  const {
    medias,
    loading,
    progress,
    error,
    directoryName,
    handleSelectDirectory,
  } = useMediaLoader();

  const {
    selectedIndex,
    selectMedia,
    closeModal,
    goToPrevious,
    goToNext,
  } = useMediaNavigation(medias.length);

  const { settings, updateSetting } = useSettings();

  useKeyboardNavigation({
    isActive: selectedIndex !== null,
    onEscape: closeModal,
    onArrowLeft: goToPrevious,
    onArrowRight: goToNext,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        directoryName={directoryName}
        mediaCount={medias.length}
        loading={loading}
        progress={progress}
        settings={settings}
        onSelectDirectory={handleSelectDirectory}
        onSettingChange={updateSetting}
      />

      <main className="container mx-auto px-4 py-6">
        {error && <ErrorMessage message={error} />}

        {!loading && medias.length === 0 && !error && <EmptyState />}

        {medias.length > 0 && (
          <MediaGrid medias={medias} onMediaClick={selectMedia} />
        )}
      </main>

      {selectedIndex !== null && medias[selectedIndex] && (
        <MediaModal
          media={medias[selectedIndex]}
          currentIndex={selectedIndex}
          totalMedia={medias.length}
          settings={settings}
          onClose={closeModal}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      )}
    </div>
  );
}
