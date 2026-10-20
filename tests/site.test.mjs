import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), 'utf8');
}

test('the page has a labeled game form and an event list', async () => {
  const html = await read('index.html');

  assert.match(html, /Sporting Events I've been to/);
  assert.match(html, /id="favorite-team-form"/);
  assert.match(html, /id="favorite-team-list"/);
  assert.match(html, /id="guide-open"/);
  assert.match(html, /id="guide-dialog"/);
  assert.match(html, /id="event-form"/);
  assert.match(html, /<option>College Baseball<\/option>/);
  assert.match(html, /<option>MLB<\/option>/);
  assert.match(html, /<option>College Basketball<\/option>/);
  assert.match(html, /<option>NBA<\/option>/);
  assert.match(html, /<option>College Football<\/option>/);
  assert.match(html, /<option>NFL<\/option>/);
  assert.doesNotMatch(html, /<option>Hockey<\/option>|<option>Soccer<\/option>/);
  assert.match(html, /for="event-sport"/);
  assert.match(html, /id="save-button-label"/);
  assert.match(html, /id="cancel-edit"/);
  assert.match(html, /for="event-home-team"/);
  assert.match(html, /for="event-away-team"/);
  assert.match(html, /for="event-date"/);
  assert.match(html, /for="event-venue"/);
  assert.match(html, /for="event-score"/);
  assert.match(html, /name="winner"/);
  assert.match(html, /aria-label="Home team won"/);
  assert.match(html, /aria-label="Away team won"/);
  assert.match(html, /for="event-notes"/);
  assert.match(html, /id="event-list"/);
  assert.match(html, /id="team-chart"/);
  assert.match(html, /id="team-legend"/);
  assert.match(html, /id="favorite-record-content"/);
  assert.match(html, /id="favorite-record-bar"/);
  assert.match(html, /id="venue-stats-list"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /js\/app\.js/);
  assert.match(html, /css\/styles\.css/);
});

test('the application saves, sorts, filters, and removes events', async () => {
  const app = await read('js/app.js');

  assert.match(app, /STORAGE_KEY\s*=\s*['"]sportsEventTrackerEvents['"]/);
  assert.match(app, /localStorage\.setItem\(STORAGE_KEY/);
  assert.match(app, /localStorage\.getItem\(STORAGE_KEY/);
  assert.match(app, /\.sort\(/);
  assert.match(app, /event-year-heading/);
  assert.match(app, /secondEvent\.date\.localeCompare\(firstEvent\.date\)/);
  assert.match(app, /event-year-heading/);
  assert.match(app, /firstEvent\.homeTeam/);
  assert.match(app, /secondEvent\.awayTeam/);
  assert.match(app, /function displayTeamStats\(/);
  assert.match(app, /function displayFavoriteRecord\(/);
  assert.match(app, /function displayVenueStats\(/);
  assert.match(app, /guideDialog\.showModal\(\)/);
  assert.match(app, /function getFavoriteTeamResults\(/);
  assert.match(app, /function getFavoriteTeamTileResult\(/);
  assert.match(app, /event-date--favorite-/);
  assert.match(app, /FAVORITES_STORAGE_KEY/);
  assert.match(app, /savedEvent\.sport === 'Baseball'/);
  assert.match(app, /savedEvent\.sport === 'Basketball'/);
  assert.match(app, /savedEvent\.sport === 'Football'/);
  assert.match(app, /toLocaleLowerCase\(\)/);
  assert.match(app, /conic-gradient/);
  assert.match(app, /sportFilter\.addEventListener\('change'/);
  assert.match(app, /deleteButton/);
  assert.match(app, /formData\.get\('score'\)/);
  assert.match(app, /formData\.get\('winner'\)/);
  assert.match(app, /formData\.get\('notes'\)/);
  assert.match(app, /createElement\('details'\)/);
  assert.match(app, /winning-team/);
  assert.match(app, /function editEvent\(/);
  assert.match(app, /cancelEditButton\.addEventListener/);
  assert.match(app, /catch \(error\)/);
});

test('the map section, venue data, and lookup script are wired in', async () => {
  const html = await read('index.html');
  const map = await read('js/map.js');
  const venues = await read('data/venues.js');

  assert.match(html, /id="venue-map"/);
  assert.match(html, /id="unlocated-list"/);
  assert.match(html, /list="venue-options"/);
  assert.match(html, /<option>NHL<\/option>/);
  assert.match(html, /leaflet@1\.9\.4/);
  assert.match(html, /data\/venues\.js/);
  assert.match(html, /js\/map\.js/);
  assert.match(map, /function displayMap\(/);
  assert.match(map, /function locateEvent\(/);
  assert.match(venues, /Aviva Stadium/);
  assert.match(venues, /Amon G\. Carter Stadium/);
});

test('team names resolve to their home venues by sport', async () => {
  const source = await read('data/venues.js');
  const { findHomeVenue, normalizeName, KNOWN_VENUES } = new Function(
    `${source}; return { findHomeVenue, normalizeName, KNOWN_VENUES };`
  )();

  assert.equal(findHomeVenue('Cowboys', 'NFL').name, 'AT&T Stadium');
  assert.equal(findHomeVenue('TCU', 'College Football').name, 'Amon G. Carter Stadium');
  assert.equal(findHomeVenue('New York Giants', 'NFL').name, 'MetLife Stadium');
  assert.equal(findHomeVenue('Giants', 'MLB').name, 'Oracle Park');
  assert.equal(findHomeVenue('Los Angeles', 'NBA'), null);
  assert.equal(findHomeVenue('Tigers', 'College Football'), null);
  assert.equal(findHomeVenue('Cowboys', 'College Basketball'), null);
  assert.equal(normalizeName('Texas A&M'), 'texas a and m');
  assert.ok(KNOWN_VENUES.every((venue) => Number.isFinite(venue.lat) && Number.isFinite(venue.lng)));
});

test('the stylesheet includes visible focus and a narrow-screen layout', async () => {
  const css = await read('css/styles.css');

  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /--primary:/);
});
