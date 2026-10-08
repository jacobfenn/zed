# Weather Dashboard

A small browser dashboard that loads weather data from a JSON file and remembers the reader's chosen theme.

## Run locally

From this directory, run:

    python3 -m http.server 8000

Then open `http://localhost:8000`.

## Features

- `fetch()` loads weather data from `data/weather.json`.
- `localStorage` remembers the selected light or dark theme.
- The page displays a useful message if weather data cannot be loaded.
- The layout adapts to narrow screens and supports keyboard focus.
