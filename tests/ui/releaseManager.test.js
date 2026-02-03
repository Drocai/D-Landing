import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { setActiveRelease, buildUI, getActiveReleaseId } from '../../src/ui/releaseManager.js';

// Test data
const testReleases = [
  {
    id: 'release-1',
    badge: 'OUT NOW',
    title: 'FIRST RELEASE',
    meta: 'Single • Live',
    desc: 'First release description.',
    cover: 'first.jpg',
    primaryCtas: [
      { label: 'Spotify', href: 'https://spotify.com/1' },
      { label: 'Apple', href: 'https://apple.com/1' }
    ],
    platforms: [
      { icon: '🎵', name: 'Spotify', cta: 'Listen now', href: 'https://spotify.com/1' }
    ]
  },
  {
    id: 'release-2',
    badge: 'COMING SOON',
    title: 'SECOND RELEASE',
    meta: 'Album • Coming soon',
    desc: 'Second release description.',
    cover: 'second.jpg',
    primaryCtas: [
      { label: 'Pre-save', href: '#' }
    ],
    platforms: [
      { icon: '⭐', name: 'Pre-save', cta: 'Save now', href: '#' }
    ]
  }
];

// HTML template for tests
const createTestDocument = () => {
  const dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="heroBadge"></div>
        <h1 id="heroTitle"></h1>
        <span id="heroMeta"></span>
        <p id="heroDesc"></p>
        <img id="heroCover" />
        <div id="heroCtas"></div>
        <div id="platformsTitle"></div>
        <div id="platformsGrid"></div>
        <div id="releaseTabs"></div>
        <div id="releaseCards"></div>
      </body>
    </html>
  `, { url: 'http://localhost/' });

  return {
    document: dom.window.document,
    window: dom.window
  };
};

describe('setActiveRelease', () => {
  let doc, win;

  beforeEach(() => {
    const { document, window } = createTestDocument();
    doc = document;
    win = window;
  });

  it('updates hero badge text', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroBadge').textContent).toBe('OUT NOW');
  });

  it('updates hero title text', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroTitle').textContent).toBe('FIRST RELEASE');
  });

  it('updates hero meta text', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroMeta').textContent).toBe('Single • Live');
  });

  it('updates hero description', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroDesc').textContent).toBe('First release description.');
  });

  it('updates hero cover image', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroCover').src).toContain('first.jpg');
  });

  it('falls back to first release for invalid ID', () => {
    setActiveRelease('non-existent', { document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroTitle').textContent).toBe('FIRST RELEASE');
  });

  it('creates CTA buttons', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    const ctas = doc.getElementById('heroCtas');
    expect(ctas.children.length).toBe(2);
  });

  it('first CTA has primary class', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    const firstCta = doc.getElementById('heroCtas').children[0];
    expect(firstCta.className).toBe('btn');
  });

  it('subsequent CTAs have secondary class', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    const secondCta = doc.getElementById('heroCtas').children[1];
    expect(secondCta.className).toBe('btn secondary');
  });

  it('CTA buttons have correct href', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    const firstCta = doc.getElementById('heroCtas').children[0];
    expect(firstCta.href).toBe('https://spotify.com/1');
  });

  it('CTA buttons open in new tab', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    const firstCta = doc.getElementById('heroCtas').children[0];
    expect(firstCta.target).toBe('_blank');
    expect(firstCta.rel).toBe('noopener noreferrer');
  });

  it('creates platform cards', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    const platforms = doc.getElementById('platformsGrid');
    expect(platforms.children.length).toBe(1);
  });

  it('platform cards have correct structure', () => {
    setActiveRelease('release-1', { document: doc, window: win, releases: testReleases });
    const platform = doc.getElementById('platformsGrid').children[0];
    expect(platform.className).toBe('platform-card');
    expect(platform.querySelector('.p-ico')).toBeTruthy();
    expect(platform.querySelector('.p-name')).toBeTruthy();
    expect(platform.querySelector('.p-cta')).toBeTruthy();
  });

  it('returns the active release object', () => {
    const result = setActiveRelease('release-2', { document: doc, window: win, releases: testReleases });
    expect(result.id).toBe('release-2');
    expect(result.title).toBe('SECOND RELEASE');
  });

  it('updates URL hash', () => {
    setActiveRelease('release-2', { document: doc, window: win, releases: testReleases });
    expect(win.location.hash).toBe('#release-2');
  });

  it('limits CTAs to 3', () => {
    const releaseWithManyCtas = {
      ...testReleases[0],
      id: 'many-ctas',
      primaryCtas: [
        { label: '1', href: '#' },
        { label: '2', href: '#' },
        { label: '3', href: '#' },
        { label: '4', href: '#' },
        { label: '5', href: '#' }
      ]
    };
    setActiveRelease('many-ctas', { document: doc, window: win, releases: [releaseWithManyCtas] });
    const ctas = doc.getElementById('heroCtas');
    expect(ctas.children.length).toBe(3);
  });
});

describe('buildUI', () => {
  let doc, win;

  beforeEach(() => {
    const { document, window } = createTestDocument();
    doc = document;
    win = window;
  });

  it('creates correct number of tabs', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const tabs = doc.getElementById('releaseTabs');
    expect(tabs.children.length).toBe(2);
  });

  it('tabs are buttons', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const tabs = doc.getElementById('releaseTabs');
    Array.from(tabs.children).forEach(tab => {
      expect(tab.tagName).toBe('BUTTON');
      expect(tab.type).toBe('button');
    });
  });

  it('tabs have correct class', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const tabs = doc.getElementById('releaseTabs');
    Array.from(tabs.children).forEach(tab => {
      expect(tab.className).toContain('tab');
    });
  });

  it('tabs have data-id attribute', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const tabs = doc.getElementById('releaseTabs');
    expect(tabs.children[0].dataset.id).toBe('release-1');
    expect(tabs.children[1].dataset.id).toBe('release-2');
  });

  it('tabs display release titles', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const tabs = doc.getElementById('releaseTabs');
    expect(tabs.children[0].textContent).toBe('FIRST RELEASE');
    expect(tabs.children[1].textContent).toBe('SECOND RELEASE');
  });

  it('creates correct number of release cards', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const cards = doc.getElementById('releaseCards');
    expect(cards.children.length).toBe(2);
  });

  it('release cards have correct class', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const cards = doc.getElementById('releaseCards');
    Array.from(cards.children).forEach(card => {
      expect(card.className).toBe('release-card');
    });
  });

  it('release cards contain title', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const cards = doc.getElementById('releaseCards');
    expect(cards.children[0].querySelector('.r-title').textContent).toBe('FIRST RELEASE');
  });

  it('release cards contain meta info', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const cards = doc.getElementById('releaseCards');
    expect(cards.children[0].querySelector('.r-sub').textContent).toBe('Single • Live');
  });

  it('release cards have thumbnail', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const cards = doc.getElementById('releaseCards');
    const thumb = cards.children[0].querySelector('.thumb img');
    expect(thumb).toBeTruthy();
    expect(thumb.src).toContain('first.jpg');
  });

  it('release cards have action buttons', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const cards = doc.getElementById('releaseCards');
    const actions = cards.children[0].querySelector('.r-actions');
    expect(actions.children.length).toBe(2);
  });

  it('sets initial release from hash', () => {
    win.location.hash = '#release-2';
    buildUI({ document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroTitle').textContent).toBe('SECOND RELEASE');
  });

  it('defaults to first release when no hash', () => {
    win.location.hash = '';
    buildUI({ document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroTitle').textContent).toBe('FIRST RELEASE');
  });

  it('defaults to first release for invalid hash', () => {
    win.location.hash = '#invalid-release';
    buildUI({ document: doc, window: win, releases: testReleases });
    expect(doc.getElementById('heroTitle').textContent).toBe('FIRST RELEASE');
  });

  it('returns tab and card counts', () => {
    const result = buildUI({ document: doc, window: win, releases: testReleases });
    expect(result.tabCount).toBe(2);
    expect(result.cardCount).toBe(2);
  });

  it('tab click changes active release', () => {
    buildUI({ document: doc, window: win, releases: testReleases });
    const tabs = doc.getElementById('releaseTabs');
    const secondTab = tabs.children[1];

    // Simulate click
    secondTab.click();

    expect(doc.getElementById('heroTitle').textContent).toBe('SECOND RELEASE');
  });
});

describe('getActiveReleaseId', () => {
  it('returns hash without #', () => {
    const mockWindow = { location: { hash: '#release-1' } };
    expect(getActiveReleaseId(mockWindow)).toBe('release-1');
  });

  it('returns null for empty hash', () => {
    const mockWindow = { location: { hash: '' } };
    expect(getActiveReleaseId(mockWindow)).toBe(null);
  });

  it('returns null for just #', () => {
    const mockWindow = { location: { hash: '#' } };
    expect(getActiveReleaseId(mockWindow)).toBe(null);
  });

  it('handles missing location', () => {
    const mockWindow = {};
    expect(getActiveReleaseId(mockWindow)).toBe(null);
  });
});
