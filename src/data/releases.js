/**
 * Release data for D RoC music catalog
 */

export const SOCIALS = {
  instagram: 'https://www.instagram.com/_d_roc_',
  tiktok: 'https://www.tiktok.com/@big.droc',
  youtube: 'https://youtube.com/@bigdroc'
};

export const RELEASES = [
  {
    id: 'i-want-it-all',
    badge: 'OUT NOW',
    title: 'I WANT IT ALL',
    meta: 'Single • Live',
    desc: 'No settling. No soft drops. Just finished work, loud.',
    cover: 'i-want-it-all.webp',
    primaryCtas: [
      { label: '🎧 Spotify', href: 'https://open.spotify.com/album/42D393HiAKcg2dZnB3IMqq' },
      { label: '🍎 Apple Music', href: 'https://music.apple.com/us/album/i-want-it-all-single/1868128752?uo=4' },
      { label: '▶️ YouTube', href: 'https://youtube.com/@bigdroc' }
    ],
    platforms: [
      { icon: '🎵', name: 'Spotify', cta: 'Stream now →', href: 'https://open.spotify.com/album/42D393HiAKcg2dZnB3IMqq' },
      { icon: '🍎', name: 'Apple Music', cta: 'Listen now →', href: 'https://music.apple.com/us/album/i-want-it-all-single/1868128752?uo=4' },
      { icon: '▶️', name: 'YouTube', cta: 'Watch + subscribe →', href: 'https://youtube.com/@bigdroc' }
    ]
  },
  {
    id: 'hush',
    badge: 'OUT NOW',
    title: 'HUSH',
    meta: 'Single • Live',
    desc: 'Quiet doesn\'t mean soft.',
    cover: 'hush.jpg',
    primaryCtas: [
      { label: '🎧 Spotify', href: 'https://open.spotify.com/album/3qLxOdcaEBBUDN14kdH5h4' },
      { label: '🍎 Apple Music', href: '#' },
      { label: '▶️ YouTube', href: 'https://youtube.com/@bigdroc' }
    ],
    platforms: [
      { icon: '🎵', name: 'Spotify', cta: 'Stream now →', href: 'https://open.spotify.com/album/3qLxOdcaEBBUDN14kdH5h4' },
      { icon: '🍎', name: 'Apple Music', cta: 'Link needed →', href: '#' },
      { icon: '▶️', name: 'YouTube', cta: 'Watch + subscribe →', href: 'https://youtube.com/@bigdroc' }
    ]
  },
  {
    id: 'dumb-bull',
    badge: 'COMING SOON',
    title: 'DUMB BULL IN A CHINA SHOP',
    meta: 'Single • Coming soon',
    desc: 'Smash-mode energy. Pre-save link incoming.',
    cover: 'dumb-bull.webp',
    primaryCtas: [
      { label: '⭐ Pre-save', href: '#' },
      { label: '▶️ YouTube', href: 'https://youtube.com/@bigdroc' }
    ],
    platforms: [
      { icon: '⭐', name: 'Pre-save', cta: 'Placeholder →', href: '#' },
      { icon: '▶️', name: 'YouTube', cta: 'Watch + subscribe →', href: 'https://youtube.com/@bigdroc' }
    ]
  }
];

/**
 * Validate a release object has all required fields
 * @param {object} release - Release object to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export function validateRelease(release) {
  const errors = [];
  const requiredFields = ['id', 'badge', 'title', 'meta', 'desc', 'cover'];

  for (const field of requiredFields) {
    if (!release[field] || typeof release[field] !== 'string') {
      errors.push(`Missing or invalid required field: ${field}`);
    }
  }

  if (!Array.isArray(release.primaryCtas)) {
    errors.push('primaryCtas must be an array');
  }

  if (!Array.isArray(release.platforms)) {
    errors.push('platforms must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if all release IDs are unique
 * @param {array} releases - Array of release objects
 * @returns {boolean}
 */
export function hasUniqueIds(releases) {
  const ids = releases.map(r => r.id);
  return new Set(ids).size === ids.length;
}

/**
 * Find a release by ID
 * @param {string} id - Release ID
 * @param {array} releases - Array of releases (defaults to RELEASES)
 * @returns {object|undefined}
 */
export function findReleaseById(id, releases = RELEASES) {
  return releases.find(r => r.id === id);
}
