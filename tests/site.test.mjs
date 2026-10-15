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
  assert.match(html, /id="event-form"/);
  assert.match(html, /for="event-sport"/);
  assert.match(html, /for="event-home-team"/);
  assert.match(html, /for="event-away-team"/);
  assert.match(html, /for="event-date"/);
  assert.match(html, /for="event-venue"/);
  assert.match(html, /id="event-list"/);
  assert.match(html, /id="sort-order"/);
  assert.match(html, /Team \/ matchup A-Z/);
  assert.match(html, /id="team-chart"/);
  assert.match(html, /id="team-legend"/);
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
  assert.match(app, /sortOrder\.value === 'team'/);
  assert.match(app, /firstEvent\.homeTeam/);
  assert.match(app, /secondEvent\.awayTeam/);
  assert.match(app, /function displayTeamStats\(/);
  assert.match(app, /toLocaleLowerCase\(\)/);
  assert.match(app, /conic-gradient/);
  assert.match(app, /sortOrder\.addEventListener\('change'/);
  assert.match(app, /sportFilter\.addEventListener\('change'/);
  assert.match(app, /deleteButton/);
  assert.match(app, /catch \(error\)/);
});

test('the stylesheet includes visible focus and a narrow-screen layout', async () => {
  const css = await read('css/styles.css');

  assert.match(css, /:focus-visible/);
  assert.match(css, /@media \(max-width: 760px\)/);
  assert.match(css, /--primary:/);
});
