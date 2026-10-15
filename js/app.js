const STORAGE_KEY = 'sportsEventTrackerEvents';
const eventForm = document.querySelector('#event-form');
const eventList = document.querySelector('#event-list');
const eventCount = document.querySelector('#event-count');
const emptyState = document.querySelector('#empty-state');
const statusMessage = document.querySelector('#status-message');
const sportFilter = document.querySelector('#sport-filter');
const sortOrder = document.querySelector('#sort-order');
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
      && savedEvent.name
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

function displayEvents() {
  eventList.replaceChildren();
  eventCount.textContent = events.length;

  const sortedEvents = [...events].sort((firstEvent, secondEvent) => (
    sortOrder.value === 'team'
      ? firstEvent.name.localeCompare(secondEvent.name)
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
    name.textContent = savedEvent.name;

    const venue = document.createElement('p');
    venue.textContent = savedEvent.venue;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.dataset.eventId = savedEvent.id;
    deleteButton.setAttribute('aria-label', `Remove ${savedEvent.name}`);
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
    name: formData.get('name').trim(),
    date: formData.get('date'),
    venue: formData.get('venue').trim()
  };

  if (!newEvent.name || !newEvent.venue) {
    statusMessage.textContent = 'Enter a game or teams and a venue before saving.';
    document.querySelector(!newEvent.name ? '#event-name' : '#event-venue').focus();
    return;
  }

  events.push(newEvent);
  const wasSaved = saveEvents();
  sportFilter.value = 'all';
  displayEvents();
  statusMessage.textContent = wasSaved
    ? `${newEvent.name} was added to your event log.`
    : 'The game was added for now, but could not be saved in this browser.';
  eventForm.reset();
  document.querySelector('#event-name').focus();
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
    ? `${removedEvent.name} was removed from your event log.`
    : 'The game was removed for now, but the change could not be saved.';
});

sportFilter.addEventListener('change', displayEvents);
sortOrder.addEventListener('change', displayEvents);
displayEvents();
