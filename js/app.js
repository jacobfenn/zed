const STORAGE_KEY = 'sportsEventTrackerEvents';
const FAVORITES_STORAGE_KEY = 'sportsEventTrackerFavorites';
const guideOpenButton = document.querySelector('#guide-open');
const guideDialog = document.querySelector('#guide-dialog');
const guideCloseButton = document.querySelector('#guide-close');
const eventForm = document.querySelector('#event-form');
const favoriteTeamForm = document.querySelector('#favorite-team-form');
const favoriteTeamList = document.querySelector('#favorite-team-list');
const favoriteTeamEmpty = document.querySelector('#favorite-team-empty');
const favoriteTeamStatus = document.querySelector('#favorite-team-status');
const eventList = document.querySelector('#event-list');
const eventCount = document.querySelector('#event-count');
const emptyState = document.querySelector('#empty-state');
const statusMessage = document.querySelector('#status-message');
const sportFilter = document.querySelector('#sport-filter');
const teamStatsContent = document.querySelector('#team-stats-content');
const teamStatsEmpty = document.querySelector('#team-stats-empty');
const teamChart = document.querySelector('#team-chart');
const teamLegend = document.querySelector('#team-legend');
const favoriteRecordContent = document.querySelector('#favorite-record-content');
const favoriteRecordEmpty = document.querySelector('#favorite-record-empty');
const favoriteWinRate = document.querySelector('#favorite-win-rate');
const favoriteRecordTally = document.querySelector('#favorite-record-tally');
const favoriteRecordBar = document.querySelector('#favorite-record-bar');
const favoriteRecordWinBar = document.querySelector('#favorite-record-win-bar');
const favoriteRecordLossBar = document.querySelector('#favorite-record-loss-bar');
const venueStatsEmpty = document.querySelector('#venue-stats-empty');
const venueStatsList = document.querySelector('#venue-stats-list');
const entryHeading = document.querySelector('#entry-heading');
const saveButtonLabel = document.querySelector('#save-button-label');
const cancelEditButton = document.querySelector('#cancel-edit');
const chartColors = ['#702340', '#c94f54', '#315f85', '#d59b3c', '#527760', '#71588b', '#547c88', '#9a6651'];
let editingEventId = null;
let venueWasAutofilled = false;
let events = loadEvents();
let favoriteTeams = loadFavoriteTeams();

function loadEvents() {
  try {
    const savedEvents = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    if (!Array.isArray(savedEvents)) {
      throw new Error('Saved events are not a list.');
    }

    return savedEvents
      .filter((savedEvent) => (
        savedEvent
        && savedEvent.id
        && savedEvent.sport
        && (savedEvent.name || savedEvent.raceName || (savedEvent.homeTeam && savedEvent.awayTeam))
        && savedEvent.date
        && savedEvent.venue
        && !Number.isNaN(Date.parse(`${savedEvent.date}T12:00:00`))
      ))
      .map((savedEvent) => {
        const sport = savedEvent.sport === 'Baseball'
          ? 'College Baseball'
          : savedEvent.sport === 'Basketball'
            ? 'NBA'
            : savedEvent.sport === 'Football'
              ? 'College Football'
              : savedEvent.sport;

        return sport === savedEvent.sport ? savedEvent : { ...savedEvent, sport };
      });
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

function loadFavoriteTeams() {
  try {
    const savedTeams = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) || '[]');
    return Array.isArray(savedTeams)
      ? savedTeams.filter((team) => typeof team === 'string' && team.trim())
      : [];
  } catch (error) {
    favoriteTeamStatus.textContent = 'Favorite teams could not be read.';
    return [];
  }
}

function saveFavoriteTeams() {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteTeams));
    return true;
  } catch (error) {
    return false;
  }
}

function displayFavoriteTeams() {
  favoriteTeamList.replaceChildren();
  favoriteTeamEmpty.hidden = favoriteTeams.length > 0;

  favoriteTeams.forEach((team) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const removeButton = document.createElement('button');

    name.textContent = team;
    removeButton.type = 'button';
    removeButton.dataset.team = team;
    removeButton.className = 'favorite-remove-button';
    removeButton.setAttribute('aria-label', `Remove ${team} from favorite teams`);
    removeButton.title = 'Remove team';
    removeButton.textContent = '×';

    item.append(name, removeButton);
    favoriteTeamList.append(item);
  });
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${date}T12:00:00`));
}

function getMatchup(savedEvent) {
  if (isNascar(savedEvent)) {
    return savedEvent.raceName || savedEvent.name;
  }

  if (savedEvent.homeTeam && savedEvent.awayTeam) {
    return `${savedEvent.homeTeam} vs ${savedEvent.awayTeam}`;
  }

  return savedEvent.name;
}

function getDisplayedMatchup(savedEvent) {
  if (isNascar(savedEvent)) {
    return getMatchup(savedEvent);
  }

  if (savedEvent.homeTeam && savedEvent.awayTeam) {
    return `${savedEvent.awayTeam} vs ${savedEvent.homeTeam}`;
  }

  const teams = getTeamNames(savedEvent);
  return teams.length === 2 ? `${teams[1]} vs ${teams[0]}` : getMatchup(savedEvent);
}

function isNascar(savedEvent) {
  return savedEvent.sport === 'NASCAR';
}

function getTeamNames(savedEvent) {
  if (isNascar(savedEvent)) {
    return [];
  }

  if (savedEvent.homeTeam && savedEvent.awayTeam) {
    return [savedEvent.homeTeam, savedEvent.awayTeam];
  }

  const oldMatchup = (savedEvent.name || '').split(/\s+vs\.?\s+/i);
  return oldMatchup.length === 2 ? oldMatchup : [savedEvent.name || ''];
}

function getFavoriteTeamResults(savedEvent) {
  const teams = getTeamNames(savedEvent);
  if (!['home', 'away'].includes(savedEvent.winner) || teams.length !== 2) {
    return [];
  }

  const favoriteNames = favoriteTeams.map((team) => team.trim().toLocaleLowerCase());
  const homeIsFavorite = favoriteNames.includes(teams[0].trim().toLocaleLowerCase());
  const awayIsFavorite = favoriteNames.includes(teams[1].trim().toLocaleLowerCase());
  const results = [];

  if (homeIsFavorite) {
    results.push(savedEvent.winner === 'home' ? 'win' : 'loss');
  }

  if (awayIsFavorite) {
    results.push(savedEvent.winner === 'away' ? 'win' : 'loss');
  }

  return results;
}

function getFavoriteTeamTileResult(savedEvent) {
  const results = getFavoriteTeamResults(savedEvent);
  if (results.includes('win')) {
    return 'win';
  }

  return results.includes('loss') ? 'loss' : '';
}

function displayFavoriteRecord() {
  const results = events.flatMap(getFavoriteTeamResults);
  const wins = results.filter((result) => result === 'win').length;
  const losses = results.filter((result) => result === 'loss').length;
  const totalResults = wins + losses;


  favoriteRecordEmpty.hidden = totalResults > 0;
  favoriteRecordContent.hidden = totalResults === 0;


  if (totalResults === 0) {
    favoriteRecordEmpty.textContent = favoriteTeams.length === 0
      ? 'Add favorite teams and record completed games to see your win rate.'
      : 'Record a completed game with a favorite team to see your win rate.';
    return;
  }

  const winPercentage = (wins / totalResults) * 100;
  favoriteWinRate.textContent = `${winPercentage.toFixed(1)}%`;
  favoriteWinRate.classList.toggle('favorite-win-rate--above', winPercentage > 50);
  favoriteWinRate.classList.toggle('favorite-win-rate--below', winPercentage < 50);
  favoriteRecordTally.textContent = `${wins} ${wins === 1 ? 'win' : 'wins'}, ${losses} ${losses === 1 ? 'loss' : 'losses'}`;
  favoriteRecordWinBar.style.width = `${winPercentage}%`;
  favoriteRecordLossBar.style.width = `${100 - winPercentage}%`;
  favoriteRecordBar.setAttribute('aria-label', `${wins} ${wins === 1 ? 'win' : 'wins'} and ${losses} ${losses === 1 ? 'loss' : 'losses'}, ${winPercentage.toFixed(1)} percent win rate`);
}

function displayVenueStats() {
  const venueCounts = new Map();

  events.forEach((savedEvent) => {
    const name = savedEvent.venue.trim();
    const key = name.toLocaleLowerCase();

    if (!key) {
      return;
    }

    const venue = venueCounts.get(key) || { name, count: 0 };
    venue.count += 1;
    venueCounts.set(key, venue);
  });

  const venues = [...venueCounts.values()].sort((firstVenue, secondVenue) => (
    secondVenue.count - firstVenue.count
    || firstVenue.name.localeCompare(secondVenue.name, undefined, { sensitivity: 'base' })
  ));


  venueStatsList.replaceChildren();
  venueStatsEmpty.hidden = venues.length > 0;
  venueStatsList.hidden = venues.length === 0;

  if (venues.length === 0) {
    return;
  }

  

  const mostVisits = venues[0].count;
  venues.forEach((venue, index) => {
    const item = document.createElement('li');
    const name = document.createElement('span');
    const count = document.createElement('span');
    const meter = document.createElement('span');
    const fill = document.createElement('span');

    item.className = index === 0 ? 'venue-stat venue-stat--top' : 'venue-stat';
    name.className = 'venue-stat-name';
    name.textContent = venue.name;
    count.className = 'venue-stat-count';
    count.textContent = `${venue.count} ${venue.count === 1 ? 'visit' : 'visits'}`;
    meter.className = 'venue-meter';
    meter.setAttribute('aria-hidden', 'true');
    fill.className = 'venue-meter-fill';
    fill.style.width = `${(venue.count / mostVisits) * 100}%`;

    meter.append(fill);
    item.append(name, count, meter);
    venueStatsList.append(item);
  });
}

function appendTeamName(matchup, teamName, isWinner) {
  const team = document.createElement('span');
  team.textContent = teamName;

  if (isWinner) {
    team.className = 'winning-team';
    team.setAttribute('aria-label', `${teamName}, winner`);
  }

  matchup.append(team);
}

const teamFields = document.querySelector('#team-fields');
const nascarFields = document.querySelector('#nascar-fields');
const scoreFields = document.querySelector('#score-fields');
const venueLabel = document.querySelector('#event-venue-label');

// Swaps the team fields for race fields; disabled inputs are skipped by validation and FormData.
function updateSportFields() {
  const nascar = eventForm.elements.sport.value === 'NASCAR';
  teamFields.hidden = nascar;
  scoreFields.hidden = nascar;
  nascarFields.hidden = !nascar;
  teamFields.querySelectorAll('input').forEach((input) => { input.disabled = nascar; });
  scoreFields.querySelectorAll('input').forEach((input) => { input.disabled = nascar; });
  nascarFields.querySelectorAll('input').forEach((input) => { input.disabled = !nascar; });
  venueLabel.textContent = nascar ? 'Track' : 'Venue';
  eventForm.elements.venue.placeholder = nascar ? 'Daytona International Speedway' : 'Amon G. Carter Stadium';
}

function resetEventForm() {
  editingEventId = null;
  venueWasAutofilled = false;
  eventForm.reset();
  updateSportFields();
  entryHeading.textContent = 'Add a game';
  saveButtonLabel.textContent = 'Save game';
  cancelEditButton.hidden = true;
}

function editEvent(savedEvent) {
  const teams = getTeamNames(savedEvent);
  editingEventId = savedEvent.id;
  venueWasAutofilled = false;
  eventForm.elements.sport.value = savedEvent.sport;
  updateSportFields();
  eventForm.elements.raceName.value = savedEvent.raceName || '';
  eventForm.elements.raceWinner.value = savedEvent.raceWinner || '';
  eventForm.elements.homeTeam.value = teams[0] || '';
  eventForm.elements.awayTeam.value = teams[1] || '';
  eventForm.elements.date.value = savedEvent.date;
  eventForm.elements.venue.value = savedEvent.venue;
  eventForm.elements.score.value = savedEvent.score || '';
  eventForm.elements.notes.value = savedEvent.notes || '';
  eventForm.querySelectorAll('input[name="winner"]').forEach((winnerOption) => {
    winnerOption.checked = winnerOption.value === (savedEvent.winner || '');
  });
  entryHeading.textContent = 'Edit game';
  saveButtonLabel.textContent = 'Save changes';
  cancelEditButton.hidden = false;
  statusMessage.textContent = `Editing ${getMatchup(savedEvent)}.`;
  eventForm.scrollIntoView({ block: 'start' });
  (isNascar(savedEvent) ? eventForm.elements.raceName : eventForm.elements.homeTeam).focus();
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
  displayFavoriteRecord();
  displayVenueStats();
  displayMap();

  const sortedEvents = [...events].sort((firstEvent, secondEvent) => (
    secondEvent.date.localeCompare(firstEvent.date)
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
  let lastYear = '';

  visibleEvents.forEach((savedEvent) => {
    const year = savedEvent.date.slice(0, 4);

    if (year !== lastYear) {
      const yearRow = document.createElement('li');
      const yearHeading = document.createElement('h3');
      yearRow.className = 'event-year-heading';
      yearHeading.textContent = year;
      yearRow.append(yearHeading);
      eventList.append(yearRow);
      lastYear = year;
    }

    const item = document.createElement('li');
    item.className = 'event-row';

    const date = document.createElement('time');
    date.className = 'event-date';
    date.dateTime = savedEvent.date;
    const dateText = document.createElement('span');
    dateText.textContent = formatDate(savedEvent.date);
    date.append(dateText);

    const favoriteResult = getFavoriteTeamTileResult(savedEvent);
    if (favoriteResult) {
      date.classList.add(`event-date--favorite-${favoriteResult}`);
      const result = document.createElement('span');
      result.className = 'event-date-result';
      result.setAttribute('aria-label', `Favorite team ${favoriteResult}`);
      result.textContent = favoriteResult === 'win' ? 'W' : 'L';
      date.append(result);
    }

    const details = document.createElement('div');
    details.className = 'event-details';

    const sport = document.createElement('span');
    sport.className = 'sport-label';
    sport.textContent = savedEvent.sport;

    const name = document.createElement('h3');
    const teams = getTeamNames(savedEvent);

    if (isNascar(savedEvent)) {
      name.textContent = getMatchup(savedEvent);
    } else if (teams.length === 2) {
      const awayTeam = savedEvent.awayTeam || teams[1];
      const homeTeam = savedEvent.homeTeam || teams[0];
      appendTeamName(name, awayTeam, savedEvent.winner === 'away');
      name.append(document.createTextNode(' vs '));
      appendTeamName(name, homeTeam, savedEvent.winner === 'home');
    } else {
      name.textContent = getDisplayedMatchup(savedEvent);
    }

    const venue = document.createElement('p');
    venue.textContent = savedEvent.venue;

    const gameResult = document.createElement('div');
    gameResult.className = 'event-result';

    if (isNascar(savedEvent) && savedEvent.raceWinner) {
      const winner = document.createElement('span');
      winner.className = 'event-score';
      winner.textContent = `Winner: ${savedEvent.raceWinner}`;
      gameResult.append(winner);
    }

    if (savedEvent.score || savedEvent.winner) {
      if (savedEvent.score) {
        const score = document.createElement('span');
        score.className = 'event-score';
        score.textContent = `Final: ${savedEvent.score}`;
        gameResult.append(score);
      }

    }

    if (savedEvent.notes) {
      const notes = document.createElement('details');
      notes.className = 'event-notes';
      const notesLabel = document.createElement('summary');
      const noteText = document.createElement('p');
      notesLabel.textContent = 'Notes';
      noteText.textContent = savedEvent.notes;
      notes.append(notesLabel, noteText);
      gameResult.append(notes);
    }

    const actions = document.createElement('div');
    actions.className = 'event-actions';

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.type = 'button';
    editButton.dataset.eventId = savedEvent.id;
    editButton.setAttribute('aria-label', `Edit ${getDisplayedMatchup(savedEvent)}`);
    editButton.title = 'Edit game';
    editButton.textContent = '✎';

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.dataset.eventId = savedEvent.id;
    deleteButton.setAttribute('aria-label', `Remove ${getDisplayedMatchup(savedEvent)}`);
    deleteButton.textContent = '×';

    details.append(sport, name, venue);
    actions.append(editButton, deleteButton);
    item.append(date, details);

    if (gameResult.childElementCount > 0) {
      item.classList.add('event-row--has-result');
      item.append(gameResult);
    }

    item.append(actions);
    eventList.append(item);
  });
}

favoriteTeamForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const team = favoriteTeamForm.elements.team.value.trim();
  const teamKey = team.toLocaleLowerCase();

  if (favoriteTeams.some((favorite) => favorite.trim().toLocaleLowerCase() === teamKey)) {
    favoriteTeamStatus.textContent = `${team} is already on your list.`;
    return;
  }

  favoriteTeams.push(team);
  const wasSaved = saveFavoriteTeams();
  displayFavoriteTeams();
  displayEvents();
  favoriteTeamStatus.textContent = wasSaved
    ? `${team} added to favorite teams.`
    : `${team} added for now, but could not be saved in this browser.`;
  favoriteTeamForm.reset();
  favoriteTeamForm.elements.team.focus();
});

favoriteTeamList.addEventListener('click', (event) => {
  const removeButton = event.target.closest('.favorite-remove-button');

  if (!removeButton) {
    return;
  }

  const removedTeam = removeButton.dataset.team;
  favoriteTeams = favoriteTeams.filter((team) => team !== removedTeam);
  const wasSaved = saveFavoriteTeams();
  displayFavoriteTeams();
  displayEvents();
  favoriteTeamStatus.textContent = wasSaved
    ? `${removedTeam} removed from favorite teams.`
    : `${removedTeam} removed for now, but the change could not be saved.`;
});

eventForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(eventForm);

  if (formData.get('sport') === 'NASCAR') {
    const raceDetails = {
      sport: 'NASCAR',
      raceName: formData.get('raceName').trim(),
      raceWinner: formData.get('raceWinner').trim(),
      date: formData.get('date'),
      venue: formData.get('venue').trim(),
      notes: formData.get('notes').trim()
    };

    if (!raceDetails.raceName || !raceDetails.raceWinner || !raceDetails.venue) {
      statusMessage.textContent = 'Enter the race name, winner, and track before saving.';
      return;
    }

    const wasEditingRace = editingEventId !== null;
    let savedRace;

    if (wasEditingRace) {
      events = events.map((existingEvent) => (
        existingEvent.id === editingEventId ? { id: existingEvent.id, ...raceDetails } : existingEvent
      ));
      savedRace = events.find((existingEvent) => existingEvent.id === editingEventId);
    } else {
      savedRace = { id: String(Date.now()), ...raceDetails };
      events.push(savedRace);
    }

    const raceSaved = saveEvents();
    sportFilter.value = 'all';
    displayEvents();
    resetEventForm();
    statusMessage.textContent = raceSaved
      ? `${savedRace.raceName} was ${wasEditingRace ? 'updated' : 'added'} in your event log.`
      : `The race was ${wasEditingRace ? 'updated' : 'added'} for now, but could not be saved in this browser.`;
    ensureVenueLocation(savedRace);
    return;
  }

  const eventDetails = {
    sport: formData.get('sport'),
    homeTeam: formData.get('homeTeam').trim(),
    awayTeam: formData.get('awayTeam').trim(),
    date: formData.get('date'),
    venue: formData.get('venue').trim(),
    score: formData.get('score').trim(),
    winner: formData.get('winner') || '',
    notes: formData.get('notes').trim()
  };

  if (!eventDetails.homeTeam || !eventDetails.awayTeam || !eventDetails.venue) {
    statusMessage.textContent = 'Enter both teams and a venue before saving.';
    const fieldToFocus = !eventDetails.homeTeam
      ? '#event-home-team'
      : !eventDetails.awayTeam
        ? '#event-away-team'
        : '#event-venue';
    document.querySelector(fieldToFocus).focus();
    return;
  }

  const wasEditing = editingEventId !== null;
  let savedEvent;

  if (wasEditing) {
    events = events.map((existingEvent) => (
      existingEvent.id === editingEventId
        ? { ...existingEvent, ...eventDetails }
        : existingEvent
    ));
    savedEvent = events.find((existingEvent) => existingEvent.id === editingEventId);
  } else {
    savedEvent = { id: String(Date.now()), ...eventDetails };
    events.push(savedEvent);
  }

  const wasSaved = saveEvents();
  sportFilter.value = 'all';
  displayEvents();
  resetEventForm();
  statusMessage.textContent = wasSaved
    ? `${getMatchup(savedEvent)} was ${wasEditing ? 'updated' : 'added'} in your event log.`
    : `The game was ${wasEditing ? 'updated' : 'added'} for now, but could not be saved in this browser.`;
  document.querySelector('#event-home-team').focus();
  ensureVenueLocation(savedEvent);
});

// Fills the venue from the home team's stadium unless the user typed their own.
function suggestVenue() {
  const venue = findHomeVenue(eventForm.elements.homeTeam.value, eventForm.elements.sport.value);
  const venueInput = eventForm.elements.venue;

  if (venue && (!venueInput.value.trim() || venueWasAutofilled)) {
    venueInput.value = venue.name;
    venueWasAutofilled = true;
  }
}

eventForm.elements.homeTeam.addEventListener('change', suggestVenue);
eventForm.elements.sport.addEventListener('change', suggestVenue);
eventForm.elements.sport.addEventListener('change', updateSportFields);
eventForm.elements.venue.addEventListener('input', () => {
  venueWasAutofilled = false;
});

eventList.addEventListener('click', (event) => {
  const editButton = event.target.closest('.edit-button');

  if (editButton) {
    const eventToEdit = events.find((savedEvent) => savedEvent.id === editButton.dataset.eventId);

    if (eventToEdit) {
      editEvent(eventToEdit);
    }

    return;
  }

  const deleteButton = event.target.closest('.delete-button');

  if (!deleteButton) {
    return;
  }

  const removedEvent = events.find((savedEvent) => savedEvent.id === deleteButton.dataset.eventId);
  if (editingEventId === removedEvent.id) {
    resetEventForm();
  }
  events = events.filter((savedEvent) => savedEvent.id !== deleteButton.dataset.eventId);
  const wasSaved = saveEvents();
  displayEvents();
  statusMessage.textContent = wasSaved
    ? `${getMatchup(removedEvent)} was removed from your event log.`
    : 'The game was removed for now, but the change could not be saved.';
});

cancelEditButton.addEventListener('click', () => {
  resetEventForm();
  statusMessage.textContent = 'Edit cancelled.';
  document.querySelector('#event-home-team').focus();
});

sportFilter.addEventListener('change', displayEvents);
guideOpenButton.addEventListener('click', () => guideDialog.showModal());
guideCloseButton.addEventListener('click', () => guideDialog.close());
displayFavoriteTeams();
displayEvents();
updateSportFields();
