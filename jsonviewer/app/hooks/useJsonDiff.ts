import { useEffect, useState } from 'react';

interface DiffResult {
  leftDiffLines: Set<number>;
  rightDiffLines: Set<number>;
}

export const useJsonDiff = (leftText: string, rightText: string, isDiffMode: boolean): DiffResult => {
  const [leftDiffLines, setLeftDiffLines] = useState<Set<number>>(new Set());
  const [rightDiffLines, setRightDiffLines] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isDiffMode) {
      setLeftDiffLines(new Set());
      setRightDiffLines(new Set());
      return;
    }

    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');

    const leftDiff = new Set<number>();
    const rightDiff = new Set<number>();

    // Simple line-by-line comparison
    const maxLines = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxLines; i++) {
      const leftLine = i < leftLines.length ? leftLines[i] : undefined;
      const rightLine = i < rightLines.length ? rightLines[i] : undefined;

      // Only compare if at least one line exists
      if (leftLine !== undefined || rightLine !== undefined) {
        // Lines are different if:
        // 1. One exists and the other doesn't
        // 2. Both exist but have different content
        if (leftLine !== rightLine) {
          if (leftLine !== undefined) {
            leftDiff.add(i + 1); // Line numbers are 1-indexed
          }
          if (rightLine !== undefined) {
            rightDiff.add(i + 1);
          }
        }
      }
    }

    setLeftDiffLines(leftDiff);
    setRightDiffLines(rightDiff);
  }, [leftText, rightText, isDiffMode]);

  return { leftDiffLines, rightDiffLines };
};
