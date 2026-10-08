const THEME_STORAGE_KEY = 'dashboardTheme';
const themeToggle = document.querySelector('#theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-toggle__icon');
const themeLabel = themeToggle.querySelector('.theme-toggle__label');
const weatherData = document.querySelector('#weather-data');
const weatherStatus = document.querySelector('#weather-status');
const weatherError = document.querySelector('#weather-error');

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('theme-dark', isDark);
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeIcon.textContent = isDark ? '☾' : '☀';
  themeLabel.textContent = isDark ? 'Dark mode' : 'Light mode';
}

function initializeTheme() {
  let savedTheme = 'light';

  try {
    savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
  } catch (error) {
    console.warn('Theme preference could not be read:', error);
  }

  applyTheme(savedTheme);
}

function toggleTheme() {
  const nextTheme = document.body.classList.contains('theme-dark') ? 'light' : 'dark';
  applyTheme(nextTheme);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  } catch (error) {
    console.warn('Theme preference could not be saved:', error);
  }
}

function displayWeather(data) {
  document.querySelector('#weather-location').textContent = data.location;
  document.querySelector('#weather-temperature').textContent = data.current.temperature;
  document.querySelector('#weather-condition').textContent = data.current.condition;
  document.querySelector('#weather-updated').textContent = `Updated ${data.current.updated}`;

  weatherStatus.hidden = true;
  weatherError.hidden = true;
  weatherData.hidden = false;
}

function displayWeatherError() {
  weatherStatus.hidden = true;
  weatherData.hidden = true;
  weatherError.hidden = false;
}

async function loadWeather() {
  try {
    const response = await fetch('./data/weather.json');

    if (!response.ok) {
      throw new Error(`Weather request failed with status ${response.status}`);
    }

    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    console.error('Error loading weather:', error);
    displayWeatherError();
  }
}

initializeTheme();
themeToggle.addEventListener('click', toggleTheme);
loadWeather();
