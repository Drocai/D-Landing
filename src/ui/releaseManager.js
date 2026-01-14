import { RELEASES, findReleaseById } from '../data/releases.js';
import { safeHref } from '../utils/safeHref.js';
import { createPlaceholderSVG } from '../utils/placeholder.js';

/**
 * Set the active release and update the hero section
 *
 * @param {string} id - Release ID to activate
 * @param {object} options - Configuration options
 * @param {Document} options.document - Document object (for testing)
 * @param {Window} options.window - Window object (for testing)
 * @param {array} options.releases - Releases array (for testing)
 */
export function setActiveRelease(id, options = {}) {
  const doc = options.document || document;
  const win = options.window || window;
  const releases = options.releases || RELEASES;

  const release = findReleaseById(id, releases) || releases[0];

  if (!release) {
    console.error('No releases available');
    return null;
  }

  // Update tab states
  const tabs = doc.querySelectorAll('.tab');
  tabs.forEach(t => t.classList.toggle('active', t.dataset.id === release.id));

  // Update hero content
  const heroBadge = doc.getElementById('heroBadge');
  const heroTitle = doc.getElementById('heroTitle');
  const heroMeta = doc.getElementById('heroMeta');
  const heroDesc = doc.getElementById('heroDesc');
  const heroCover = doc.getElementById('heroCover');
  const heroCtas = doc.getElementById('heroCtas');
  const platformsTitle = doc.getElementById('platformsTitle');
  const platformsGrid = doc.getElementById('platformsGrid');

  if (heroBadge) heroBadge.textContent = release.badge;
  if (heroTitle) heroTitle.textContent = release.title;
  if (heroMeta) heroMeta.textContent = release.meta;
  if (heroDesc) heroDesc.textContent = release.desc;

  // Update cover image
  if (heroCover) {
    const coverSrc = release.cover ? release.cover : createPlaceholderSVG(release.title);
    heroCover.src = coverSrc;
    heroCover.onerror = () => {
      heroCover.src = createPlaceholderSVG(release.title);
    };
  }

  // Build CTA buttons
  if (heroCtas) {
    heroCtas.innerHTML = '';
    (release.primaryCtas || []).slice(0, 3).forEach((c, idx) => {
      const a = doc.createElement('a');
      a.className = 'btn' + (idx === 0 ? '' : ' secondary');
      a.textContent = c.label;
      a.href = safeHref(c.href);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      heroCtas.appendChild(a);
    });
  }

  // Update platforms section
  if (platformsTitle) {
    platformsTitle.textContent = 'Open this release';
  }

  if (platformsGrid) {
    platformsGrid.innerHTML = '';
    (release.platforms || []).forEach(p => {
      const a = doc.createElement('a');
      a.className = 'platform-card';
      a.href = safeHref(p.href);
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.innerHTML = `
        <div class='p-ico'>${p.icon}</div>
        <div class='p-meta'>
          <div class='p-name'>${p.name}</div>
          <div class='p-cta'>${p.cta}</div>
        </div>
      `;
      platformsGrid.appendChild(a);
    });
  }

  // Update URL hash
  if (win.history && win.location) {
    try {
      const url = new URL(win.location.href);
      url.hash = release.id;
      win.history.replaceState({}, '', url);
    } catch {
      // Ignore URL errors in test environments
    }
  }

  return release;
}

/**
 * Build the initial UI including tabs and release cards
 *
 * @param {object} options - Configuration options
 * @param {Document} options.document - Document object (for testing)
 * @param {Window} options.window - Window object (for testing)
 * @param {array} options.releases - Releases array (for testing)
 */
export function buildUI(options = {}) {
  const doc = options.document || document;
  const win = options.window || window;
  const releases = options.releases || RELEASES;

  // Build release tabs
  const tabs = doc.getElementById('releaseTabs');
  if (tabs) {
    tabs.innerHTML = '';
    releases.forEach(r => {
      const b = doc.createElement('button');
      b.className = 'tab';
      b.type = 'button';
      b.dataset.id = r.id;
      b.textContent = r.title;
      b.addEventListener('click', () => setActiveRelease(r.id, options));
      tabs.appendChild(b);
    });
  }

  // Build release cards
  const cards = doc.getElementById('releaseCards');
  if (cards) {
    cards.innerHTML = '';
    releases.forEach(r => {
      const card = doc.createElement('div');
      card.className = 'release-card';

      const thumbSrc = r.cover ? r.cover : createPlaceholderSVG(r.title);

      card.innerHTML = `
        <div class='thumb'><img alt='${r.title} cover' src='${thumbSrc}' onerror="this.src='${createPlaceholderSVG(r.title)}'" /></div>
        <div>
          <div class='r-title'>${r.title}</div>
          <div class='r-sub'>${r.meta}</div>
          <div class='r-actions'>
            <a class='mini' href='${safeHref((r.primaryCtas?.[0] || {}).href)}' target='_blank' rel='noopener noreferrer'>Open</a>
            <a class='mini secondary' href='#' data-go='${r.id}'>View here</a>
          </div>
        </div>
      `;

      const viewLink = card.querySelector('[data-go]');
      if (viewLink) {
        viewLink.addEventListener('click', (e) => {
          e.preventDefault();
          setActiveRelease(r.id, options);
          win.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      cards.appendChild(card);
    });
  }

  // Set initial release from hash or default to first
  const hash = (win.location?.hash || '').replace('#', '');
  const start = releases.some(r => r.id === hash) ? hash : releases[0]?.id;
  if (start) {
    setActiveRelease(start, options);
  }

  return { tabCount: releases.length, cardCount: releases.length };
}

/**
 * Get the currently active release ID from URL hash
 *
 * @param {Window} win - Window object
 * @returns {string|null}
 */
export function getActiveReleaseId(win = window) {
  const hash = (win.location?.hash || '').replace('#', '');
  return hash || null;
}
