const STORAGE_KEY = 'sportsEventTrackerEvents';
const eventForm = document.querySelector('#event-form');
const eventList = document.querySelector('#event-list');
const eventCount = document.querySelector('#event-count');
const emptyState = document.querySelector('#empty-state');
const statusMessage = document.querySelector('#status-message');
const sportFilter = document.querySelector('#sport-filter');
const sortOrder = document.querySelector('#sort-order');
const teamStatsContent = document.querySelector('#team-stats-content');
const teamStatsEmpty = document.querySelector('#team-stats-empty');
const teamChart = document.querySelector('#team-chart');
const teamLegend = document.querySelector('#team-legend');
const chartColors = ['#702340', '#c94f54', '#315f85', '#d59b3c', '#527760', '#71588b', '#547c88', '#9a6651'];
let events = loadEvents();

function loadEvents() {
  try {
    const savedEvents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (!Array.isArray(savedEvents)) {
      throw new Error('Saved events are not a list.');
    }

    return savedEvents.filter((savedEvent) => (
      savedEvent
      && savedEvent.id
      && savedEvent.sport
      && (savedEvent.name || (savedEvent.homeTeam && savedEvent.awayTeam))
      && savedEvent.date
      && savedEvent.venue
      && !Number.isNaN(Date.parse(`${savedEvent.date}T12:00:00`))
    ));
  } catch (error) {
    statusMessage.textContent = 'Saved events could not be read. You can start a new list.';
    return [];
  }
}

function saveEvents() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    return true;
  } catch (error) {
    return false;
  }
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${date}T12:00:00`));
}

function getMatchup(savedEvent) {
  if (savedEvent.homeTeam && savedEvent.awayTeam) {
    return `${savedEvent.homeTeam} vs. ${savedEvent.awayTeam}`;
  }

  return savedEvent.name;
}

function getTeamNames(savedEvent) {
  if (savedEvent.homeTeam && savedEvent.awayTeam) {
    return [savedEvent.homeTeam, savedEvent.awayTeam];
  }

  const oldMatchup = (savedEvent.name || '').split(/\s+vs\.?\s+/i);
  return oldMatchup.length === 2 ? oldMatchup : [savedEvent.name || ''];
}

function displayTeamStats() {
  const teamCounts = new Map();

  events.forEach((savedEvent) => {
    getTeamNames(savedEvent).forEach((teamName) => {
      const name = teamName.trim();
      const key = name.toLocaleLowerCase();

      if (!key) {
        return;
      }

      const team = teamCounts.get(key) || { name, count: 0 };
      team.count += 1;
      teamCounts.set(key, team);
    });
  });

  const teams = [...teamCounts.values()].sort((firstTeam, secondTeam) => (
    secondTeam.count - firstTeam.count
    || firstTeam.name.localeCompare(secondTeam.name, undefined, { sensitivity: 'base' })
  ));
  const totalAppearances = teams.reduce((total, team) => total + team.count, 0);

  teamLegend.replaceChildren();
  teamStatsEmpty.hidden = totalAppearances > 0;
  teamStatsContent.hidden = totalAppearances === 0;

  if (totalAppearances === 0) {
    return;
  }

  let endAngle = 0;
  const segments = teams.map((team, index) => {
    const startAngle = endAngle;
    endAngle += (team.count / totalAppearances) * 100;
    const color = chartColors[index % chartColors.length];
    const percentage = ((team.count / totalAppearances) * 100).toFixed(1);
    const item = document.createElement('li');
    const swatch = document.createElement('span');
    const name = document.createElement('span');
    const count = document.createElement('span');
    const percent = document.createElement('span');

    swatch.className = 'team-swatch';
    swatch.style.backgroundColor = color;
    swatch.setAttribute('aria-hidden', 'true');
    name.className = 'team-legend-name';
    name.textContent = team.name;
    count.className = 'team-appearance-count';
    count.textContent = `${team.count} ${team.count === 1 ? 'appearance' : 'appearances'}`;
    percent.className = 'team-legend-percent';
    percent.textContent = `${percentage}%`;

    item.append(swatch, name, count, percent);
    teamLegend.append(item);

    return `${color} ${startAngle}% ${endAngle}%`;
  });

  teamChart.style.background = `conic-gradient(${segments.join(', ')})`;
  teamChart.setAttribute('aria-label', `Team appearances: ${teams.map((team) => (
    `${team.name}, ${((team.count / totalAppearances) * 100).toFixed(1)} percent`
  )).join('; ')}`);
}

function displayEvents() {
  eventList.replaceChildren();
  eventCount.textContent = events.length;
  displayTeamStats();

  const sortedEvents = [...events].sort((firstEvent, secondEvent) => (
    sortOrder.value === 'team'
      ? (firstEvent.homeTeam || firstEvent.name).localeCompare(secondEvent.homeTeam || secondEvent.name)
        || (firstEvent.awayTeam || '').localeCompare(secondEvent.awayTeam || '')
      : secondEvent.date.localeCompare(firstEvent.date)
  ));
  const selectedSport = sportFilter.value;
  const visibleEvents = sortedEvents.filter((savedEvent) => (
    selectedSport === 'all' || savedEvent.sport === selectedSport
  ));

  if (visibleEvents.length === 0) {
    emptyState.hidden = false;
    emptyState.textContent = events.length === 0
      ? 'No games added yet. Your first one can go here.'
      : 'No saved games for this sport yet.';
    return;
  }

  emptyState.hidden = true;

  visibleEvents.forEach((savedEvent) => {
    const item = document.createElement('li');
    item.className = 'event-row';

    const date = document.createElement('time');
    date.className = 'event-date';
    date.dateTime = savedEvent.date;
    date.textContent = formatDate(savedEvent.date);

    const details = document.createElement('div');
    details.className = 'event-details';

    const sport = document.createElement('span');
    sport.className = 'sport-label';
    sport.textContent = savedEvent.sport;

    const name = document.createElement('h3');
    name.textContent = getMatchup(savedEvent);

    const venue = document.createElement('p');
    venue.textContent = savedEvent.venue;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.dataset.eventId = savedEvent.id;
    deleteButton.setAttribute('aria-label', `Remove ${getMatchup(savedEvent)}`);
    deleteButton.textContent = '×';

    details.append(sport, name, venue);
    item.append(date, details, deleteButton);
    eventList.append(item);
  });
}

eventForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(eventForm);
  const newEvent = {
    id: String(Date.now()),
    sport: formData.get('sport'),
    homeTeam: formData.get('homeTeam').trim(),
    awayTeam: formData.get('awayTeam').trim(),
    date: formData.get('date'),
    venue: formData.get('venue').trim()
  };

  if (!newEvent.homeTeam || !newEvent.awayTeam || !newEvent.venue) {
    statusMessage.textContent = 'Enter both teams and a venue before saving.';
    const fieldToFocus = !newEvent.homeTeam
      ? '#event-home-team'
      : !newEvent.awayTeam
        ? '#event-away-team'
        : '#event-venue';
    document.querySelector(fieldToFocus).focus();
    return;
  }

  events.push(newEvent);
  const wasSaved = saveEvents();
  sportFilter.value = 'all';
  sortOrder.value = 'date';
  displayEvents();
  statusMessage.textContent = wasSaved
    ? `${getMatchup(newEvent)} was added to your event log.`
    : 'The game was added for now, but could not be saved in this browser.';
  eventForm.reset();
  document.querySelector('#event-home-team').focus();
});

eventList.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.delete-button');

  if (!deleteButton) {
    return;
  }

  const removedEvent = events.find((savedEvent) => savedEvent.id === deleteButton.dataset.eventId);
  events = events.filter((savedEvent) => savedEvent.id !== deleteButton.dataset.eventId);
  const wasSaved = saveEvents();
  displayEvents();
  statusMessage.textContent = wasSaved
    ? `${getMatchup(removedEvent)} was removed from your event log.`
    : 'The game was removed for now, but the change could not be saved.';
});

sportFilter.addEventListener('change', displayEvents);
sortOrder.addEventListener('change', displayEvents);
displayEvents();
