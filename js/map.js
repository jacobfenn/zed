const LOCATIONS_STORAGE_KEY = 'sportsEventTrackerVenueLocations';
const venueMapElement = document.querySelector('#venue-map');
const mapSummary = document.querySelector('#map-summary');
const mapStatus = document.querySelector('#map-status');
const mapUnavailable = document.querySelector('#map-unavailable');
const mapCancelButton = document.querySelector('#map-cancel');
const unlocatedSection = document.querySelector('#unlocated-venues');
const unlocatedList = document.querySelector('#unlocated-list');
const venueOptions = document.querySelector('#venue-options');
let venueLocations = loadVenueLocations();
let leafletMap = null;
let pinLayer = null;
let pickingVenueKey = null;
let pickingVenueName = '';

function loadVenueLocations() {
  try {
    const saved = JSON.parse(localStorage.getItem(LOCATIONS_STORAGE_KEY) || '{}');
    const locations = {};

    Object.entries(saved && typeof saved === 'object' ? saved : {}).forEach(([key, location]) => {
      if (location && Number.isFinite(location.lat) && Number.isFinite(location.lng)) {
        locations[key] = location;
      }
    });

    return locations;
  } catch (error) {
    return {};
  }
}

function saveVenueLocations() {
  try {
    localStorage.setItem(LOCATIONS_STORAGE_KEY, JSON.stringify(venueLocations));
    return true;
  } catch (error) {
    return false;
  }
}

function fillVenueOptions() {
  KNOWN_VENUES.forEach((venue) => {
    const option = document.createElement('option');
    option.value = venue.name;
    option.label = venue.city;
    venueOptions.append(option);
  });
}

// Known venue names win, then locations the user saved or searched for.
function locateEvent(savedEvent) {
  const key = normalizeName(savedEvent.venue);
  const known = venueByName.get(key);

  if (known) {
    return { name: known.name, city: known.city, lat: known.lat, lng: known.lng, source: 'known', key };
  }

  const custom = venueLocations[key];
  return custom
    ? { name: savedEvent.venue.trim(), city: '', lat: custom.lat, lng: custom.lng, source: custom.source, key }
    : null;
}

function setMapStatus(message) {
  mapStatus.textContent = message;
}

function stopPicking() {
  pickingVenueKey = null;
  pickingVenueName = '';
  mapCancelButton.hidden = true;
  venueMapElement.classList.remove('venue-map--picking');
}

function startPicking(key, name) {
  if (!leafletMap) {
    setMapStatus('The map could not be loaded, so a pin cannot be placed.');
    return;
  }

  pickingVenueKey = key;
  pickingVenueName = name;
  mapCancelButton.hidden = false;
  venueMapElement.classList.add('venue-map--picking');
  leafletMap.closePopup();
  setMapStatus(`Click the map to place ${name}.`);
  venueMapElement.scrollIntoView({ block: 'center' });
}

async function searchVenueOnline(key, name) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(name)}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      return false;
    }

    const [match] = await response.json();
    const lat = match ? Number.parseFloat(match.lat) : NaN;
    const lng = match ? Number.parseFloat(match.lon) : NaN;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return false;
    }

    venueLocations[key] = { lat, lng, source: 'search' };
    saveVenueLocations();
    return true;
  } catch (error) {
    return false;
  }
}

async function ensureVenueLocation(savedEvent) {
  if (locateEvent(savedEvent)) {
    return;
  }

  const name = savedEvent.venue.trim();
  setMapStatus(`Searching online for ${name}...`);
  const found = await searchVenueOnline(normalizeName(name), name);
  displayMap();
  setMapStatus(found
    ? `${name} was found by online search. Check its pin and move it if it looks wrong.`
    : `${name} could not be located. Place it on the map from the list below.`);
}

function buildPopup(group) {
  const box = document.createElement('div');
  const title = document.createElement('strong');
  const detail = document.createElement('p');
  const games = document.createElement('ul');

  title.textContent = group.name;
  detail.className = 'map-popup-detail';
  detail.textContent = `${group.city ? `${group.city} · ` : ''}${group.games.length} ${group.games.length === 1 ? 'visit' : 'visits'}`;
  games.className = 'map-popup-games';

  group.games
    .sort((first, second) => second.date.localeCompare(first.date))
    .slice(0, 8)
    .forEach((savedEvent) => {
      const item = document.createElement('li');
      item.textContent = `${formatDate(savedEvent.date)}: ${getDisplayedMatchup(savedEvent)}`;
      games.append(item);
    });

  box.append(title, detail, games);

  if (group.source !== 'known') {
    const move = document.createElement('button');
    move.type = 'button';
    move.className = 'map-popup-button';
    move.textContent = 'Move pin';
    move.addEventListener('click', () => startPicking(group.key, group.name));
    box.append(move);
  }

  return box;
}

function displayUnlocated(unlocated) {
  unlocatedList.replaceChildren();
  unlocatedSection.hidden = unlocated.size === 0;

  unlocated.forEach((name, key) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    const search = document.createElement('button');
    const place = document.createElement('button');

    label.textContent = name;
    search.type = 'button';
    search.className = 'map-action-button';
    search.dataset.action = 'search';
    search.dataset.key = key;
    search.dataset.name = name;
    search.textContent = 'Search online';
    place.type = 'button';
    place.className = 'map-action-button';
    place.dataset.action = 'place';
    place.dataset.key = key;
    place.dataset.name = name;
    place.textContent = 'Place on map';

    item.append(label, search, place);
    unlocatedList.append(item);
  });
}

function displayMap() {
  const visibleEvents = events.filter((savedEvent) => (
    sportFilter.value === 'all' || savedEvent.sport === sportFilter.value
  ));
  const groups = new Map();
  const unlocated = new Map();

  visibleEvents.forEach((savedEvent) => {
    const location = locateEvent(savedEvent);

    if (!location) {
      unlocated.set(normalizeName(savedEvent.venue), savedEvent.venue.trim());
      return;
    }

    const groupKey = `${location.lat.toFixed(4)},${location.lng.toFixed(4)}`;
    const group = groups.get(groupKey) || { ...location, games: [] };
    group.games.push(savedEvent);
    groups.set(groupKey, group);
  });

  displayUnlocated(unlocated);
  const locatedGames = [...groups.values()].reduce((total, group) => total + group.games.length, 0);
  mapSummary.textContent = groups.size === 0
    ? 'Add games to see where you have been.'
    : `${groups.size} ${groups.size === 1 ? 'place' : 'places'} across ${locatedGames} ${locatedGames === 1 ? 'game' : 'games'}.`;

  if (typeof L === 'undefined') {
    mapUnavailable.hidden = false;
    venueMapElement.hidden = true;
    return;
  }

  if (!leafletMap) {
    leafletMap = L.map(venueMapElement).setView([39.5, -98.35], 4);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(leafletMap);
    pinLayer = L.layerGroup().addTo(leafletMap);
    leafletMap.on('click', (mapEvent) => {
      if (!pickingVenueKey) {
        return;
      }

      const name = pickingVenueName;
      venueLocations[pickingVenueKey] = { lat: mapEvent.latlng.lat, lng: mapEvent.latlng.lng, source: 'manual' };
      const wasSaved = saveVenueLocations();
      stopPicking();
      displayMap();
      setMapStatus(wasSaved
        ? `${name} placed on the map.`
        : `${name} placed for now, but the location could not be saved.`);
    });
  }

  pinLayer.clearLayers();
  const mostVisits = Math.max(1, ...[...groups.values()].map((group) => group.games.length));
  const points = [];

  groups.forEach((group) => {
    const radius = 6 + (group.games.length / mostVisits) * 8;
    L.circleMarker([group.lat, group.lng], {
      radius,
      color: '#4d4160',
      weight: 2,
      fillColor: '#c94f54',
      fillOpacity: 0.8
    })
      .bindPopup(buildPopup(group))
      .bindTooltip(group.name)
      .addTo(pinLayer);
    points.push([group.lat, group.lng]);
  });

  if (points.length === 1) {
    leafletMap.setView(points[0], 12);
  } else if (points.length > 1) {
    leafletMap.fitBounds(points, { padding: [40, 40], maxZoom: 10 });
  }
}

unlocatedList.addEventListener('click', async (event) => {
  const button = event.target.closest('.map-action-button');

  if (!button) {
    return;
  }

  const { action, key, name } = button.dataset;

  if (action === 'place') {
    startPicking(key, name);
    return;
  }

  button.disabled = true;
  setMapStatus(`Searching online for ${name}...`);
  const found = await searchVenueOnline(key, name);
  displayMap();
  setMapStatus(found
    ? `${name} was found by online search. Check its pin and move it if it looks wrong.`
    : `${name} could not be found. Try placing it on the map instead.`);
});

mapCancelButton.addEventListener('click', () => {
  stopPicking();
  setMapStatus('Placing cancelled.');
});

fillVenueOptions();
