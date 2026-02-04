/**
 * Generate a placeholder SVG data URI for missing cover images
 *
 * @param {string} label - Text to display on placeholder
 * @returns {string} - Data URI for SVG image
 */
export function createPlaceholderSVG(label) {
  // Sanitize label to prevent XSS
  const safe = sanitizeLabel(label);

  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='900' height='900'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' stop-color='#d4af37' stop-opacity='0.25'/>
          <stop offset='1' stop-color='#ff2a2a' stop-opacity='0.22'/>
        </linearGradient>
      </defs>
      <rect width='100%' height='100%' fill='#090909'/>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle'
            font-family='Inter, system-ui, sans-serif' font-size='64' font-weight='900'
            fill='rgba(255,255,255,0.92)'>${safe}</text>
      <text x='50%' y='58%' dominant-baseline='middle' text-anchor='middle'
            font-family='Inter, system-ui, sans-serif' font-size='22' font-weight='800'
            fill='rgba(255,255,255,0.55)'>DADDY FREQUENCY</text>
    </svg>`;

  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

/**
 * Sanitize a label string to prevent XSS in SVG
 *
 * @param {string} label - Raw label text
 * @returns {string} - Sanitized label
 */
export function sanitizeLabel(label) {
  if (!label || typeof label !== 'string') {
    return 'D RoC';
  }

  // Escape potentially dangerous characters
  return label
    .replace(/&/g, '&amp;')    // Escape ampersand
    .replace(/</g, '&lt;')     // Escape less-than
    .replace(/>/g, '&gt;')     // Escape greater-than
    .replace(/"/g, '&quot;')   // Escape quotes
    .replace(/'/g, '&#39;')    // Escape single quotes
    .trim() || 'D RoC';
}

/**
 * Check if a string is a valid data URI
 *
 * @param {string} uri - String to check
 * @returns {boolean}
 */
export function isDataUri(uri) {
  if (!uri || typeof uri !== 'string') {
    return false;
  }
  return uri.startsWith('data:');
}

/**
 * Check if a data URI is an SVG
 *
 * @param {string} uri - Data URI to check
 * @returns {boolean}
 */
export function isSvgDataUri(uri) {
  if (!isDataUri(uri)) {
    return false;
  }
  return uri.startsWith('data:image/svg+xml');
}
