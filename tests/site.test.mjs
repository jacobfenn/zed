import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), 'utf8');
}

test('the dashboard exposes the weather and theme controls', async () => {
  const html = await read('index.html');

  assert.match(html, /id="weather-data"/);
  assert.match(html, /id="theme-toggle"/);
  assert.match(html, /aria-live="polite"/);
  assert.match(html, /js\/app\.js/);
  assert.match(html, /css\/styles\.css/);
});

test('the application loads weather with an error state and persists themes', async () => {
  const app = await read('js/app.js');

  assert.match(app, /fetch\(['"]\.\/data\/weather\.json['"]/);
  assert.match(app, /THEME_STORAGE_KEY\s*=\s*['"]dashboardTheme['"]/);
  assert.match(app, /localStorage\.setItem\(THEME_STORAGE_KEY/);
  assert.match(app, /localStorage\.getItem\(THEME_STORAGE_KEY\)/);
  assert.match(app, /displayWeatherError/);
  assert.match(app, /aria-pressed/);
});

test('the weather JSON and stylesheet are valid project assets', async () => {
  const data = JSON.parse(await read('data/weather.json'));
  const css = await read('css/styles.css');

  assert.ok(data.location && data.current && data.forecast);
  assert.match(css, /theme-dark/);
  assert.match(css, /@media/);
});
