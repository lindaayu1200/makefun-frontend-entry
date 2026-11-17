// make.fun's public API: read-only GET requests, open to any origin (CORS).
// The full API is described at https://make.fun/api/openapi.json.

const API = 'https://make.fun/api';

async function get(path) {
  const res = await fetch(API + path);
  if (!res.ok) throw new Error(`API ${res.status} on ${path}`);
  return res.json();
}

/** The open bounties: { items: [...] } (activity=times leaves out the activity a board does not show). */
export const getBounties = () => get('/competitions?status=open&activity=times');

/** One bounty, by its slug. */
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);

/** One bounty's live leaderboard: { entries: [...], phase, rank_key, ... }. */
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);

/** One account's public profile, by handle. */
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);

/** One account's competition record, by handle (joined from the profile's detail view). */
export const getProfileEntries = (handle) => get(`/profiles/${encodeURIComponent(handle)}/views`);
