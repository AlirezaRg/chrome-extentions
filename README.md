# Rasco New Tab

A cyberpunk-themed Chrome extension that replaces your new tab page with a futuristic neon dashboard.

![preview](https://i.imgur.com/placeholder.png)

## Features

- **Animated Globe** — rotating 3D Earth with city hotspots
- **Live Clock & Date** — Orbitron font, real-time
- **Search Bar** — Google search on Enter
- **Quick Links** — Docs, Mail, Calendar, Drive, GitHub, Notes + custom links
- **Today's Tasks** — add/check tasks, saved to localStorage
- **Live Weather** — real-time data for Tehran via Open-Meteo (no API key needed)
- **System Stats** — CPU / Memory / Network with live chart
- **Cyberpunk Background** — city skyline, floating particles, neon glow

## Installation

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder
5. Open a new tab — enjoy!

## Tech Stack

- Vanilla HTML / CSS / JavaScript
- Canvas API for globe & chart animations
- [Open-Meteo API](https://open-meteo.com/) for weather (free, no key)
- Chrome Extension Manifest V3

## Project Structure

```
newtab-extension/
├── manifest.json
├── newtab.html
├── style.css
├── script.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Part of Rasco

This extension is part of the [Rasco](https://github.com/AlirezaRg/Rasco-Gosi) AI desktop assistant project.
