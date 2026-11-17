// A make.fun frontend: the board of open bounties, each bounty's page and leaderboard, and
// any account's public profile, on hash routes.
//
//   #/                              the board
//   #/bounty/<slug>                 one bounty
//   #/bounty/<slug>/leaderboard     its leaderboard
//   #/account/<handle>              an account's profile
//
// window.__shotReady is false while a page loads and true once its data is on screen, so a
// screenshot script knows when to capture.

import { getBounties, getBounty, getLeaderboard, getProfile } from './api.js';
import { board, bounty, leaderboard, profile } from './views.js';
import { aboutSections, aboutHtml } from './about.js';

const app = document.getElementById('app');

/** Every route, in the order they are tried: [pattern, loader, view, title]. */
const ROUTES = [
  [
    /^#\/bounty\/([^/]+)\/leaderboard$/,
    (m) => getLeaderboard(decodeURIComponent(m[1])),
    (data, m) => leaderboard(data, decodeURIComponent(m[1])),
    (data, m) => `Leaderboard · ${decodeURIComponent(m[1])} · make.fun`,
  ],
  [
    /^#\/bounty\/([^/]+)$/,
    (m) => getBounty(decodeURIComponent(m[1])),
    (data) => bounty(data),
    (data) => `${data.title ?? 'Bounty'} · make.fun`,
  ],
  [
    /^#\/account\/([^/]+)$/,
    (m) => getProfile(decodeURIComponent(m[1])),
    (data, m) => profile(data, decodeURIComponent(m[1])),
    (data, m) => `@${data.handle ?? decodeURIComponent(m[1])} · make.fun`,
  ],
  [/^#\/about$/, () => aboutSections(), (data) => aboutHtml(data), () => 'About · make.fun'],
  [/^#\/?$/, () => getBounties(), (data) => board(data), () => 'make.fun bounties'],
];

function fail(err) {
  app.innerHTML = `<p class="error">Could not load this page: ${String(err.message ?? err)}</p>`;
  window.__shotReady = true;
}

async function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';
  for (const [pattern, load, view, title] of ROUTES) {
    const match = hash.match(pattern);
    if (!match) continue;
    try {
      const data = await load(match);
      document.title = title(data, match);
      app.innerHTML = view(data, match);
      window.scrollTo(0, 0);
      markActive(hash);
      window.__shotReady = true;
    } catch (err) {
      fail(err);
    }
    return;
  }
  app.innerHTML = '<p class="error">No such page. <a href="#/">Back to the board</a>.</p>';
  window.__shotReady = true;
}

function markActive(hash) {
  for (const link of document.querySelectorAll('.tabs a')) {
    link.classList.toggle('active', link.getAttribute('href') === hash);
  }
}

window.addEventListener('hashchange', render);
render();
