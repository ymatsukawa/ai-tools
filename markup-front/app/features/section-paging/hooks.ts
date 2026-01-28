import { useState, useMemo, useCallback, useEffect } from 'react';
import { splitMarkdownBySections, type Section } from './utils';

export function useSectionPaging(content: string, splitLevel: number) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const sections = useMemo(() => {
    return splitMarkdownBySections(content, splitLevel);
  }, [content, splitLevel]);

  const totalPages = sections.length;

  // Reset to first page when split level changes
  useEffect(() => {
    setCurrentPageIndex(0);
  }, [splitLevel]);

  const safeIndex = Math.min(currentPageIndex, Math.max(0, totalPages - 1));
  const currentSection: Section = sections[safeIndex] || { title: '', content: '' };

  const hasPrev = safeIndex > 0;
  const hasNext = safeIndex < totalPages - 1;

  const scrollToTop = () => window.scrollTo({ top: 0 });

  const goNext = useCallback(() => {
    setCurrentPageIndex(prev => Math.min(prev + 1, totalPages - 1));
    scrollToTop();
  }, [totalPages]);

  const goPrev = useCallback(() => {
    setCurrentPageIndex(prev => Math.max(prev - 1, 0));
    scrollToTop();
  }, []);

  return {
    sections,
    currentPageIndex: safeIndex,
    totalPages,
    currentSection,
    hasPrev,
    hasNext,
    goNext,
    goPrev,
  };
}
