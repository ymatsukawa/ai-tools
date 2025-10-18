// Font loader utility for dynamic font loading
const loadedFonts = new Set<string>();

// Normalize font family by removing quotes
function normalizeFontFamily(fontFamily: string): string {
  return fontFamily.replace(/['"]/g, '');
}

export function loadFont(fontFamily: string): void {
  // Check if running in browser
  if (typeof document === 'undefined') {
    return;
  }

  const normalizedFont = normalizeFontFamily(fontFamily);

  if (loadedFonts.has(normalizedFont)) {
    return; // Font already loaded
  }

  const fontUrl = getFontUrl(normalizedFont);
  if (!fontUrl) {
    console.warn(`Font URL not found for: ${normalizedFont}`);
    return;
  }

  // Create link element for font
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = fontUrl;
  document.head.appendChild(link);

  loadedFonts.add(normalizedFont);
  console.log(`Loaded font: ${normalizedFont}`);
}

function getFontUrl(fontFamily: string): string {
  const fontMap: Record<string, string> = {
    'Inter': 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    'Noto Sans JP': 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700&display=swap',
    'Noto Serif JP': 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400;500;700&display=swap',
    'Sawarabi Mincho': 'https://fonts.googleapis.com/css2?family=Sawarabi+Mincho&display=swap',
    'Sawarabi Gothic': 'https://fonts.googleapis.com/css2?family=Sawarabi+Gothic&display=swap',
    'Kosugi Maru': 'https://fonts.googleapis.com/css2?family=Kosugi+Maru&display=swap',
    'Kosugi': 'https://fonts.googleapis.com/css2?family=Kosugi&display=swap',
    'M PLUS Rounded 1c': 'https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;400;500;700&display=swap',
    'M PLUS 1p': 'https://fonts.googleapis.com/css2?family=M+PLUS+1p:wght@300;400;500;700&display=swap',
    'Shippori Mincho': 'https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;500;600;700&display=swap',
    'Klee One': 'https://fonts.googleapis.com/css2?family=Klee+One:wght@400;600&display=swap',
  };

  return fontMap[fontFamily] || '';
}
