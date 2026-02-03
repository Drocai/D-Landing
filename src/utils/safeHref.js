/**
 * Safely validate and return a URL href
 * Returns '#' for invalid or potentially dangerous URLs
 *
 * @param {string} href - The URL to validate
 * @returns {string} - Safe URL or '#'
 */
export function safeHref(href) {
  // Handle falsy values
  if (!href || typeof href !== 'string') {
    return '#';
  }

  const trimmed = href.trim();

  // Empty after trim
  if (!trimmed) {
    return '#';
  }

  // Allow hash links
  if (trimmed.startsWith('#')) {
    return trimmed;
  }

  // Allow relative paths
  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  // Validate absolute URLs
  try {
    const url = new URL(trimmed);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return '#';
    }

    return trimmed;
  } catch {
    // If URL parsing fails, it might be a relative path without leading slash
    // Be conservative and reject
    return '#';
  }
}

/**
 * Check if a URL is a valid external link
 * @param {string} href - The URL to check
 * @returns {boolean}
 */
export function isExternalLink(href) {
  if (!href || typeof href !== 'string') {
    return false;
  }

  try {
    const url = new URL(href);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Check if a URL is a placeholder (just '#')
 * @param {string} href - The URL to check
 * @returns {boolean}
 */
export function isPlaceholderLink(href) {
  return !href || href === '#';
}
