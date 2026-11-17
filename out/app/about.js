// A no-build, browser-only client for the public face of make.fun.
// The copy below is deliberately plain: it explains the pages a visitor can reach and the
// small set of read-only requests that fill them.

import { esc } from './format.js';

const API_HOST = 'https://make.fun/api';
const SPEC_URL = `${API_HOST}/openapi.json`;

/**
 * Build the text for an About page.
 *
 * Every returned item is a { title, body } pair, kept separate from markup so a caller can
 * reuse, reorder, or translate the copy without touching the renderer below.
 */
export function aboutSections() {
  return [
    {
      title: 'What this frontend is',
      body:
        'A static site: plain HTML, CSS and ES modules served straight from the app folder. ' +
        'There is no bundler, no account to create here, and no server-side code. Open ' +
        'index.html through the small local server and the browser does the rest.',
    },
    {
      title: 'The pages you can visit',
      body:
        'Hash routes pick the view. #/ shows the board, #/bounty/<slug> opens one bounty, ' +
        '#/bounty/<slug>/leaderboard shows its ranking, and #/account/<handle> shows a ' +
        'public profile. Following a link changes the hash, so pages work with the back button.',
    },
    {
      title: 'What the board shows',
      body:
        'The board lists every open bounty, ordered by the current pot. Each card carries ' +
        'the summary, the prize plus fees paid in, the entry cost, a live countdown, the ' +
        'submission count and the sponsor when one is named. Free entries are called out.',
    },
    {
      title: 'Inside a bounty',
      body:
        'A bounty page collects the overview: opening time, closing time, result due date, ' +
        'the full description, a rewards table and a link back to make.fun. Two tabs switch ' +
        'between that overview and the leaderboard without leaving the page layout.',
    },
    {
      title: 'Leaderboards and profiles',
      body:
        'The leaderboard lists rank, handle, entry title, judge win rate and finish status. ' +
        'Handles link to profiles, where you can read a bio, competition record, prize total, ' +
        'GitHub name and wallet address when the account publishes them.',
    },
    {
      title: 'Where the numbers come from',
      body:
        `All data is fetched from ${API_HOST}. The endpoints are public, read-only GET ` +
        'requests with CORS enabled, so no key, token or login is needed. The machine-readable ' +
        'contract lives at the OpenAPI document linked below.',
    },
    {
      title: 'The requests we make',
      body:
        'The board calls /competitions with status=open and activity=times. A bounty calls ' +
        '/competitions/{slug}; its ranking calls /competitions/{slug}/leaderboard; a profile ' +
        'calls /profiles/{handle}. A helper for /profiles/{handle}/views exists as well, ' +
        'though the profile view uses the record returned with the profile itself.',
    },
    {
      title: 'Slugs, handles and errors',
      body:
        'Route parameters are decoded, then encoded again before they go into a URL, so odd ' +
        'characters cannot break a request. A non-OK response raises an error with the status ' +
        'code and path; the page then shows a short failure message instead of a blank screen.',
    },
    {
      title: 'Small display details',
      body:
        'Shared helpers escape text before it enters HTML, format dollar amounts, print dates ' +
        'in UTC and turn deadlines into short countdowns. While a route loads, a ready flag ' +
        'stays false so a screenshot script knows exactly when the data is on screen.',
    },
    {
      title: 'Why it stays small',
      body:
        'Only a handful of files are involved: one module for API calls, one for views, one ' +
        'for formatting, and a router that ties them together. Adding a section here does not ' +
        'change any of those pieces; it only adds another block of explanation.',
    },
  ];
}

/**
 * Turn section data into a fragment of HTML.
 *
 * Bodies are treated as plain text. Blank lines split paragraphs, and every dynamic value is
 * escaped by the shared helper before it is placed in the returned string.
 */
export function aboutHtml(sections) {
  const entries = Array.isArray(sections) ? sections : aboutSections();

  const rendered = entries
    .map((section, index) => {
      const heading = esc(section?.title ?? 'Untitled');
      const raw = String(section?.body ?? '');
      const paragraphs = raw
        .split(/\n\s*\n/)
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => `<p>${esc(part)}</p>`)
        .join('\n        ');

      return `
      <section class="about-section">
        <h2>${index + 1}. ${heading}</h2>
        ${paragraphs || '<p class="sub">No details yet.</p>'}
      </section>`;
    })
    .join('');

  const shortcuts = `
      <li><a href="#/">Back to the open bounties</a></li>
      <li><a href="${esc(SPEC_URL)}" target="_blank" rel="noreferrer">Read the make.fun API spec</a></li>`;

  return `
    <p><a href="#/">&larr; All bounties</a></p>
    <div class="page-head">
      <h1>About this make.fun frontend</h1>
      <span class="chip">static · public data</span>
    </div>
    <p class="summary">A short guide to these pages and the requests behind them.</p>
    <ul class="about-links">${shortcuts}
    </ul>
    <div class="about-content">${rendered}
    </div>
    <p class="sub">Values are read live from <code>${esc(API_HOST)}</code> each time a page loads.</p>`;
}
