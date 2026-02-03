import { describe, it, expect } from 'vitest';
import {
  createPlaceholderSVG,
  sanitizeLabel,
  isDataUri,
  isSvgDataUri
} from '../../src/utils/placeholder.js';

describe('createPlaceholderSVG', () => {
  it('returns a data URI', () => {
    const result = createPlaceholderSVG('Test');
    expect(result).toMatch(/^data:image\/svg\+xml/);
  });

  it('returns a properly encoded URI', () => {
    const result = createPlaceholderSVG('Test');
    expect(result).toContain('charset=UTF-8');
  });

  it('includes the label text', () => {
    const result = createPlaceholderSVG('MY ALBUM');
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain('MY ALBUM');
  });

  it('includes DADDY FREQUENCY branding', () => {
    const result = createPlaceholderSVG('Test');
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain('DADDY FREQUENCY');
  });

  it('handles empty label with default', () => {
    const result = createPlaceholderSVG('');
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain('D RoC');
  });

  it('handles null label with default', () => {
    const result = createPlaceholderSVG(null);
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain('D RoC');
  });

  it('handles undefined label with default', () => {
    const result = createPlaceholderSVG(undefined);
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain('D RoC');
  });

  it('creates valid SVG structure', () => {
    const result = createPlaceholderSVG('Test');
    const decoded = decodeURIComponent(result.replace('data:image/svg+xml;charset=UTF-8,', ''));
    expect(decoded).toContain('<svg');
    expect(decoded).toContain('</svg>');
    expect(decoded).toContain('xmlns=');
  });

  it('includes gradient definition', () => {
    const result = createPlaceholderSVG('Test');
    const decoded = decodeURIComponent(result);
    expect(decoded).toContain('linearGradient');
    expect(decoded).toContain('#d4af37'); // gold color
    expect(decoded).toContain('#ff2a2a'); // red color
  });
});

describe('sanitizeLabel', () => {
  it('removes angle brackets', () => {
    expect(sanitizeLabel('<script>')).toBe('script');
    expect(sanitizeLabel('test<>value')).toBe('testvalue');
  });

  it('escapes ampersand', () => {
    expect(sanitizeLabel('Rock & Roll')).toBe('Rock &amp; Roll');
  });

  it('escapes double quotes', () => {
    expect(sanitizeLabel('Say "Hello"')).toBe('Say &quot;Hello&quot;');
  });

  it('escapes single quotes', () => {
    expect(sanitizeLabel("It's time")).toBe('It&#39;s time');
  });

  it('returns default for null', () => {
    expect(sanitizeLabel(null)).toBe('D RoC');
  });

  it('returns default for undefined', () => {
    expect(sanitizeLabel(undefined)).toBe('D RoC');
  });

  it('returns default for empty string', () => {
    expect(sanitizeLabel('')).toBe('D RoC');
  });

  it('returns default for non-string', () => {
    expect(sanitizeLabel(123)).toBe('D RoC');
    expect(sanitizeLabel({})).toBe('D RoC');
  });

  it('trims whitespace', () => {
    expect(sanitizeLabel('  Test  ')).toBe('Test');
  });

  it('returns default for whitespace-only', () => {
    expect(sanitizeLabel('   ')).toBe('D RoC');
  });

  it('prevents XSS attempts', () => {
    const malicious = '<img src=x onerror=alert(1)>';
    const result = sanitizeLabel(malicious);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });
});

describe('isDataUri', () => {
  it('returns true for data URIs', () => {
    expect(isDataUri('data:image/svg+xml,<svg></svg>')).toBe(true);
    expect(isDataUri('data:text/plain,hello')).toBe(true);
  });

  it('returns false for regular URLs', () => {
    expect(isDataUri('https://example.com')).toBe(false);
    expect(isDataUri('http://example.com')).toBe(false);
  });

  it('returns false for relative paths', () => {
    expect(isDataUri('/images/cover.jpg')).toBe(false);
    expect(isDataUri('cover.jpg')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isDataUri(null)).toBe(false);
    expect(isDataUri(undefined)).toBe(false);
  });

  it('returns false for non-strings', () => {
    expect(isDataUri(123)).toBe(false);
    expect(isDataUri({})).toBe(false);
  });
});

describe('isSvgDataUri', () => {
  it('returns true for SVG data URIs', () => {
    expect(isSvgDataUri('data:image/svg+xml,<svg></svg>')).toBe(true);
    expect(isSvgDataUri('data:image/svg+xml;charset=UTF-8,<svg></svg>')).toBe(true);
  });

  it('returns false for other data URIs', () => {
    expect(isSvgDataUri('data:image/png;base64,ABC123')).toBe(false);
    expect(isSvgDataUri('data:text/plain,hello')).toBe(false);
  });

  it('returns false for regular URLs', () => {
    expect(isSvgDataUri('https://example.com/image.svg')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isSvgDataUri(null)).toBe(false);
    expect(isSvgDataUri(undefined)).toBe(false);
  });
});
