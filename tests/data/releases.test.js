import { describe, it, expect } from 'vitest';
import {
  RELEASES,
  SOCIALS,
  validateRelease,
  hasUniqueIds,
  findReleaseById
} from '../../src/data/releases.js';

describe('RELEASES data', () => {
  it('contains at least one release', () => {
    expect(RELEASES.length).toBeGreaterThan(0);
  });

  it('has unique IDs for all releases', () => {
    expect(hasUniqueIds(RELEASES)).toBe(true);
  });

  describe('each release', () => {
    RELEASES.forEach(release => {
      describe(`"${release.title}"`, () => {
        it('has a valid structure', () => {
          const result = validateRelease(release);
          expect(result.valid).toBe(true);
          if (!result.valid) {
            console.log(`Validation errors for ${release.id}:`, result.errors);
          }
        });

        it('has a non-empty id', () => {
          expect(release.id).toBeTruthy();
          expect(typeof release.id).toBe('string');
          expect(release.id.length).toBeGreaterThan(0);
        });

        it('has a non-empty title', () => {
          expect(release.title).toBeTruthy();
          expect(typeof release.title).toBe('string');
        });

        it('has a non-empty badge', () => {
          expect(release.badge).toBeTruthy();
          expect(typeof release.badge).toBe('string');
        });

        it('has a non-empty description', () => {
          expect(release.desc).toBeTruthy();
          expect(typeof release.desc).toBe('string');
        });

        it('has a cover path', () => {
          expect(release.cover).toBeTruthy();
          expect(typeof release.cover).toBe('string');
        });

        it('has primaryCtas array', () => {
          expect(Array.isArray(release.primaryCtas)).toBe(true);
          expect(release.primaryCtas.length).toBeGreaterThan(0);
        });

        it('has platforms array', () => {
          expect(Array.isArray(release.platforms)).toBe(true);
          expect(release.platforms.length).toBeGreaterThan(0);
        });

        it('has valid CTA structure', () => {
          release.primaryCtas.forEach((cta, index) => {
            expect(cta.label, `CTA ${index} missing label`).toBeTruthy();
            expect(cta.href, `CTA ${index} missing href`).toBeDefined();
          });
        });

        it('has valid platform structure', () => {
          release.platforms.forEach((platform, index) => {
            expect(platform.icon, `Platform ${index} missing icon`).toBeTruthy();
            expect(platform.name, `Platform ${index} missing name`).toBeTruthy();
            expect(platform.cta, `Platform ${index} missing cta`).toBeTruthy();
            expect(platform.href, `Platform ${index} missing href`).toBeDefined();
          });
        });
      });
    });
  });
});

describe('SOCIALS data', () => {
  it('has instagram link', () => {
    expect(SOCIALS.instagram).toBeTruthy();
    expect(SOCIALS.instagram).toMatch(/instagram\.com/);
  });

  it('has tiktok link', () => {
    expect(SOCIALS.tiktok).toBeTruthy();
    expect(SOCIALS.tiktok).toMatch(/tiktok\.com/);
  });

  it('has youtube link', () => {
    expect(SOCIALS.youtube).toBeTruthy();
    expect(SOCIALS.youtube).toMatch(/youtube\.com/);
  });

  it('all links are https', () => {
    Object.values(SOCIALS).forEach(url => {
      expect(url).toMatch(/^https:\/\//);
    });
  });
});

describe('validateRelease', () => {
  it('returns valid for complete release', () => {
    const release = {
      id: 'test',
      badge: 'OUT NOW',
      title: 'Test Title',
      meta: 'Single',
      desc: 'Description',
      cover: 'cover.jpg',
      primaryCtas: [],
      platforms: []
    };
    const result = validateRelease(release);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns invalid for missing id', () => {
    const release = {
      badge: 'OUT NOW',
      title: 'Test',
      meta: 'Single',
      desc: 'Desc',
      cover: 'cover.jpg',
      primaryCtas: [],
      platforms: []
    };
    const result = validateRelease(release);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing or invalid required field: id');
  });

  it('returns invalid for missing title', () => {
    const release = {
      id: 'test',
      badge: 'OUT NOW',
      meta: 'Single',
      desc: 'Desc',
      cover: 'cover.jpg',
      primaryCtas: [],
      platforms: []
    };
    const result = validateRelease(release);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Missing or invalid required field: title');
  });

  it('returns invalid for non-array primaryCtas', () => {
    const release = {
      id: 'test',
      badge: 'OUT NOW',
      title: 'Test',
      meta: 'Single',
      desc: 'Desc',
      cover: 'cover.jpg',
      primaryCtas: 'not an array',
      platforms: []
    };
    const result = validateRelease(release);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('primaryCtas must be an array');
  });

  it('returns invalid for non-array platforms', () => {
    const release = {
      id: 'test',
      badge: 'OUT NOW',
      title: 'Test',
      meta: 'Single',
      desc: 'Desc',
      cover: 'cover.jpg',
      primaryCtas: [],
      platforms: null
    };
    const result = validateRelease(release);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('platforms must be an array');
  });

  it('returns multiple errors for multiple issues', () => {
    const release = {
      id: 'test',
      primaryCtas: 'bad',
      platforms: 'bad'
    };
    const result = validateRelease(release);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('hasUniqueIds', () => {
  it('returns true for unique IDs', () => {
    const releases = [
      { id: 'one' },
      { id: 'two' },
      { id: 'three' }
    ];
    expect(hasUniqueIds(releases)).toBe(true);
  });

  it('returns false for duplicate IDs', () => {
    const releases = [
      { id: 'one' },
      { id: 'two' },
      { id: 'one' }
    ];
    expect(hasUniqueIds(releases)).toBe(false);
  });

  it('returns true for empty array', () => {
    expect(hasUniqueIds([])).toBe(true);
  });

  it('returns true for single item', () => {
    expect(hasUniqueIds([{ id: 'only' }])).toBe(true);
  });
});

describe('findReleaseById', () => {
  it('finds release by ID', () => {
    const result = findReleaseById('i-want-it-all');
    expect(result).toBeDefined();
    expect(result.title).toBe('I WANT IT ALL');
  });

  it('returns undefined for non-existent ID', () => {
    const result = findReleaseById('does-not-exist');
    expect(result).toBeUndefined();
  });

  it('works with custom releases array', () => {
    const customReleases = [
      { id: 'custom-1', title: 'Custom Release' }
    ];
    const result = findReleaseById('custom-1', customReleases);
    expect(result).toBeDefined();
    expect(result.title).toBe('Custom Release');
  });

  it('returns undefined for empty array', () => {
    const result = findReleaseById('any', []);
    expect(result).toBeUndefined();
  });
});
