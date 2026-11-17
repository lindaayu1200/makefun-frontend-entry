// The pages, each a function from API data to HTML.

import { date, esc, money, timeLeft } from './format.js';

/** The reward as it stands now: the prize plus any entry fees paid into it. */
const pot = (b) => money(b.potUsd ?? b.rewardAmount);

/** The entry fee, when the bounty charges one. */
const fee = (b) => (b.entryFeeUsd ? `${money(b.entryFeeUsd)} entry fee` : '');

const slugLink = (b) => `#/bounty/${encodeURIComponent(b.slug)}`;

/** The board: every open bounty, its live pot, fee, deadline and entry count. */
export function board(data) {
  const rows = data.items
    .slice()
    .sort((a, b) => (b.potUsd ?? b.rewardAmount ?? 0) - (a.potUsd ?? a.rewardAmount ?? 0))
    .map(
      (b) => `
      <li class="card">
        <div class="card-top">
          <a class="title" href="${slugLink(b)}">${esc(b.title)}</a>
          <span class="pot">${pot(b)}</span>
        </div>
        <p class="summary">${esc(b.summary ?? '')}</p>
        <div class="meta">
          ${fee(b) ? `<span class="chip fee">${esc(fee(b))}</span>` : '<span class="chip free">Free entry</span>'}
          <span class="chip">${timeLeft(b.deadline)}</span>
          <span class="chip">${b.submissionCount} ${b.submissionCount === 1 ? 'entry' : 'entries'}</span>
          ${b.sponsor?.name ? `<span class="chip">${esc(b.sponsor.name)}</span>` : ''}
        </div>
      </li>`,
    )
    .join('');
  return `<h1>Open bounties <span class="count">${data.items.length}</span></h1><ul class="board">${rows}</ul>`;
}

/** One bounty's page: summary, description, rules, dates, rewards and links. */
export function bounty(b) {
  const rows = (b.rewardsNow ?? [])
    .map((r) => `<tr><td>${r.place}</td><td>${money(r.amountUsd ?? r.baseUsd ?? 0)}</td></tr>`)
    .join('');
  const dates = [
    ['Opens', date(b.openedAt ?? b.startsAt)],
    ['Entries close', date(b.deadline)],
    ['Result due', date(b.resultDue ?? b.resultAt)],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join('');
  return `
    <p><a href="#/">&larr; All bounties</a></p>
    <div class="page-head">
      <h1>${esc(b.title)}</h1>
      <div class="meta">
        <span class="pot big">${pot(b)}</span>
        ${fee(b) ? `<span class="chip fee">${esc(fee(b))}</span>` : '<span class="chip free">Free entry</span>'}
        <span class="chip">${timeLeft(b.deadline)}</span>
        <span class="chip">${b.submissionCount} entries</span>
      </div>
    </div>
    <p class="summary">${esc(b.summary ?? '')}</p>
    <div class="tabs">
      <a class="tab active" href="${slugLink(b)}">Overview</a>
      <a class="tab" href="${slugLink(b)}/leaderboard">Leaderboard</a>
    </div>
    <div class="panel">
      <dl class="dates">${dates}</dl>
      <h2>Description</h2>
      <div class="description">${esc(b.description ?? '')}</div>
      ${rows ? `<h2>Rewards</h2><table class="rewards"><tr><th>Place</th><th>Prize</th></tr>${rows}</table>` : ''}
      ${b.url ? `<p><a class="ext" href="https://make.fun${esc(b.url)}" target="_blank" rel="noreferrer">Open on make.fun &rarr;</a></p>` : ''}
    </div>`;
}

/** One bounty's leaderboard: every ranked entry with its judge rate. */
export function leaderboard(data, slug) {
  const cols = data.columns ?? [];
  const rate = (e) => {
    const v = e.values?.[data.rank_key ?? 'judge'];
    return v == null ? '—' : Math.round(v).toLocaleString('en-US');
  };
  const rows = (data.entries ?? [])
    .map(
      (e) => `
      <tr>
        <td class="rank">${e.rank}</td>
        <td><a href="#/account/${encodeURIComponent(e.handle)}">${esc(e.handle)}</a></td>
        <td class="grow">${esc(e.title ?? '')}</td>
        <td class="num">${rate(e)}</td>
        <td>${e.status === 'finished' ? '✓' : esc(e.status ?? '')}</td>
      </tr>`,
    )
    .join('');
  const phase = data.phase ? `${esc(data.phase.title ?? '')} · ${esc(data.view ?? '')}` : '';
  return `
    <p><a href="#/">&larr; All bounties</a></p>
    <h1>${esc(slug)} leaderboard</h1>
    <p class="sub">${phase} — ranked by ${esc(data.rank_key ?? 'judge')} win rate</p>
    <table class="lb">
      <tr><th>Rank</th><th>Account</th><th class="grow">Entry</th><th>${esc(data.rank_key ?? 'judge')}</th><th>Done</th></tr>
      ${rows}
    </table>`;
}

/** One account's public profile: identity, record and links. */
export function profile(p, handle) {
  const r = p.record ?? {};
  const rows = [
    ['Competitions entered', r.competitions_entered],
    ['Podium finishes', r.podium_finishes],
    ['Other placements', r.other_placements],
    ['Wins', r.competitions_won],
    ['Prizes won', p.prizesUsd != null ? money(p.prizesUsd) : r.prizes_usd != null ? money(r.prizes_usd) : null],
    ['Joined', date(p.joined_at)],
  ].filter(([, v]) => v != null);
  return `
    <p><a href="#/">&larr; All bounties</a></p>
    <div class="page-head">
      <h1>@${esc(p.handle ?? handle)}</h1>
      ${p.house ? '<span class="chip">house</span>' : ''}
    </div>
    ${p.bio ? `<p class="summary">${esc(p.bio)}</p>` : ''}
    <div class="panel">
      <dl class="dates">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(String(v))}</dd>`).join('')}</dl>
      ${p.github_login ? `<p><a class="ext" href="https://github.com/${esc(p.github_login)}" target="_blank" rel="noreferrer">GitHub: ${esc(p.github_login)}</a></p>` : ''}
      ${p.wallet?.address ? `<p class="sub">Wallet: <code>${esc(p.wallet.address)}</code></p>` : ''}
    </div>`;
}
