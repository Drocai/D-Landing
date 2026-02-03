import { describe, it, expect } from 'vitest';
import { safeHref, isExternalLink, isPlaceholderLink } from '../../src/utils/safeHref.js';

describe('safeHref', () => {
  describe('falsy inputs', () => {
    it('returns # for null', () => {
      expect(safeHref(null)).toBe('#');
    });

    it('returns # for undefined', () => {
      expect(safeHref(undefined)).toBe('#');
    });

    it('returns # for empty string', () => {
      expect(safeHref('')).toBe('#');
    });

    it('returns # for whitespace-only string', () => {
      expect(safeHref('   ')).toBe('#');
    });

    it('returns # for non-string types', () => {
      expect(safeHref(123)).toBe('#');
      expect(safeHref({})).toBe('#');
      expect(safeHref([])).toBe('#');
    });
  });

  describe('valid URLs', () => {
    it('returns valid https URLs unchanged', () => {
      const url = 'https://open.spotify.com/album/123';
      expect(safeHref(url)).toBe(url);
    });

    it('returns valid http URLs unchanged', () => {
      const url = 'http://example.com/page';
      expect(safeHref(url)).toBe(url);
    });

    it('handles URLs with query parameters', () => {
      const url = 'https://music.apple.com/album?id=123&uo=4';
      expect(safeHref(url)).toBe(url);
    });

    it('handles URLs with fragments', () => {
      const url = 'https://example.com/page#section';
      expect(safeHref(url)).toBe(url);
    });
  });

  describe('hash links', () => {
    it('returns hash links unchanged', () => {
      expect(safeHref('#')).toBe('#');
      expect(safeHref('#section')).toBe('#section');
      expect(safeHref('#releases')).toBe('#releases');
    });
  });

  describe('relative paths', () => {
    it('returns relative paths starting with / unchanged', () => {
      expect(safeHref('/page')).toBe('/page');
      expect(safeHref('/images/cover.jpg')).toBe('/images/cover.jpg');
    });
  });

  describe('dangerous URLs', () => {
    it('blocks javascript: URLs', () => {
      expect(safeHref('javascript:alert(1)')).toBe('#');
      expect(safeHref('javascript:void(0)')).toBe('#');
    });

    it('blocks data: URLs', () => {
      expect(safeHref('data:text/html,<script>alert(1)</script>')).toBe('#');
    });

    it('blocks vbscript: URLs', () => {
      expect(safeHref('vbscript:msgbox(1)')).toBe('#');
    });

    it('blocks file: URLs', () => {
      expect(safeHref('file:///etc/passwd')).toBe('#');
    });

    it('blocks ftp: URLs', () => {
      expect(safeHref('ftp://example.com')).toBe('#');
    });
  });

  describe('edge cases', () => {
    it('trims whitespace from valid URLs', () => {
      expect(safeHref('  https://example.com  ')).toBe('https://example.com');
    });

    it('rejects malformed URLs without protocol', () => {
      expect(safeHref('not-a-valid-url')).toBe('#');
    });
  });
});

describe('isExternalLink', () => {
  it('returns true for https URLs', () => {
    expect(isExternalLink('https://spotify.com')).toBe(true);
  });

  it('returns true for http URLs', () => {
    expect(isExternalLink('http://example.com')).toBe(true);
  });

  it('returns false for hash links', () => {
    expect(isExternalLink('#section')).toBe(false);
  });

  it('returns false for relative paths', () => {
    expect(isExternalLink('/page')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isExternalLink(null)).toBe(false);
    expect(isExternalLink(undefined)).toBe(false);
  });
});

describe('isPlaceholderLink', () => {
  it('returns true for #', () => {
    expect(isPlaceholderLink('#')).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isPlaceholderLink('')).toBe(true);
  });

  it('returns true for null/undefined', () => {
    expect(isPlaceholderLink(null)).toBe(true);
    expect(isPlaceholderLink(undefined)).toBe(true);
  });

  it('returns false for valid URLs', () => {
    expect(isPlaceholderLink('https://spotify.com')).toBe(false);
  });

  it('returns false for hash links with content', () => {
    expect(isPlaceholderLink('#section')).toBe(false);
  });
});
