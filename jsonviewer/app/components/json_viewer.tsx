import { useState } from 'react';
import { useJsonValidation } from '~/hooks/useJsonValidation';
import { useJsonDiff } from '~/hooks/useJsonDiff';
import { useJsonDropzone } from '~/hooks/useJsonDropzone';
import { useModal } from '~/hooks/useModal';
import { useSettings } from '~/hooks/useSettings';
import { useJsonFormatter } from '~/hooks/useJsonFormatter';
import { useClipboard } from '~/hooks/useClipboard';
import { Modal } from './Modal';
import { ButtonBar } from './ButtonBar';
import { JsonPanel } from './JsonPanel';
import { SettingsModal } from './SettingsModal';

export const JsonViewer = () => {
  const [jsonText, setJsonText] = useState('');
  const [jsonTextRight, setJsonTextRight] = useState('');
  const [isDiffMode, setIsDiffMode] = useState(false);

  // Custom hooks
  const { invalidLines } = useJsonValidation(jsonText);
  const { invalidLines: invalidLinesRight } = useJsonValidation(jsonTextRight);
  const { leftDiffLines, rightDiffLines } = useJsonDiff(jsonText, jsonTextRight, isDiffMode);
  const { modalState, showModal, closeModal } = useModal();
  const {
    isOpen: isSettingsOpen,
    selectedFont,
    fontSize,
    openSettings,
    closeSettings,
    handleFontChange,
    handleFontSizeChange,
  } = useSettings();
  const { formatJson, formatDualJson } = useJsonFormatter();
  const { copyToClipboard } = useClipboard();

  // Dropzones
  const leftDropzone = useJsonDropzone({
    onFileLoaded: (content) => setJsonText(content),
  });

  const rightDropzone = useJsonDropzone({
    onFileLoaded: (content) => setJsonTextRight(content),
  });

  // Event handlers
  const handleFormat = () => {
    if (isDiffMode) {
      const { leftResult, rightResult } = formatDualJson(jsonText, jsonTextRight);

      if (leftResult.success && leftResult.formatted) {
        setJsonText(leftResult.formatted);
      }
      if (rightResult.success && rightResult.formatted) {
        setJsonTextRight(rightResult.formatted);
      }

      // Show error messages
      if (!leftResult.success && !rightResult.success) {
        showModal("Both panels contain invalid JSON");
      } else if (!leftResult.success) {
        showModal("Left panel contains invalid JSON");
      } else if (!rightResult.success) {
        showModal("Right panel contains invalid JSON");
      }
    } else {
      const result = formatJson(jsonText);
      if (result.success && result.formatted) {
        setJsonText(result.formatted);
      } else {
        showModal(result.error || "It's not json");
      }
    }
  };

  const handleCopy = async () => {
    const result = await copyToClipboard(jsonText);
    showModal(result.message);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
  };

  const handleTextChangeRight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonTextRight(e.target.value);
  };

  const handleToggleDiff = () => {
    setIsDiffMode(!isDiffMode);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <ButtonBar
        onFormat={handleFormat}
        onCopy={handleCopy}
        onSelectFile={leftDropzone.open}
        onDiff={handleToggleDiff}
        onSettings={openSettings}
        isDiffMode={isDiffMode}
        showInvalidLabel={invalidLines.size > 0}
      />

      {!isDiffMode ? (
        // Single panel mode
        <JsonPanel
          jsonText={jsonText}
          invalidLines={invalidLines}
          onChange={handleTextChange}
          getRootProps={leftDropzone.getRootProps}
          getInputProps={leftDropzone.getInputProps}
          isDragActive={leftDropzone.isDragActive}
          fontFamily={selectedFont}
          fontSize={fontSize}
        />
      ) : (
        // Diff mode - two panels side by side
        <div className="flex-1 flex overflow-hidden">
          <JsonPanel
            jsonText={jsonText}
            invalidLines={invalidLines}
            onChange={handleTextChange}
            getRootProps={leftDropzone.getRootProps}
            getInputProps={leftDropzone.getInputProps}
            isDragActive={leftDropzone.isDragActive}
            fontFamily={selectedFont}
            fontSize={fontSize}
            diffLines={leftDiffLines}
            diffType="left"
            label="Left"
            className="border-r-2 border-gray-300"
          />

          <JsonPanel
            jsonText={jsonTextRight}
            invalidLines={invalidLinesRight}
            onChange={handleTextChangeRight}
            getRootProps={rightDropzone.getRootProps}
            getInputProps={rightDropzone.getInputProps}
            isDragActive={rightDropzone.isDragActive}
            fontFamily={selectedFont}
            fontSize={fontSize}
            diffLines={rightDiffLines}
            diffType="right"
            label="Right"
          />
        </div>
      )}

      <Modal
        isOpen={modalState.isOpen}
        message={modalState.message}
        onClose={closeModal}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        selectedFont={selectedFont}
        onFontChange={handleFontChange}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
      />
    </div>
  );
};
