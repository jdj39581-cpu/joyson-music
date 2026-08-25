# Mood‑Based Music Player

A lightweight web app that accepts a mood (text/emoji) and returns a Spotify playlist with 30‑second preview tracks. The mood is translated to a searchable query using Gemini, then the Spotify Web API provides a matching playlist.

## Features (Free tier)
- Mood input (text + emoji picker)
- AI prompt → Spotify query (Gemini)
- Client‑credentials Spotify access (no user login)
- Playback of 30‑second preview URLs only (no premium subscription required)
- Simple React front‑end + Express back‑end

## Prerequisites
- Node.js ≥ 18
- A **Spotify Developer** account – create an app and obtain `CLIENT_ID` and `CLIENT_SECRET` (free tier).
- A **Gemini API key** (free tier is sufficient for our simple prompts).

## Setup
1. Clone / copy the repository.
2. Create a `.env` file (see `.env.example`).
3. Install dependencies and run both client and server.

```bash
# from the project root
npm install               # installs both client & server deps (workspaces)
# In one terminal
npm run dev:server        # starts Express on http://localhost:4000
# In another terminal
npm run dev:client        # starts Vite dev server on http://localhost:5173
```

Open http://localhost:5173 in your browser, type a mood, and enjoy the generated playlist!

## Project Structure
```
<PROJECT_ROOT>/
│   README.md
│   package.json
│   .gitignore
│   .env.example
│
├─ client/                # React front‑end (Vite)
│   ├─ public/index.html
│   └─ src/
│       ├─ index.jsx
│       ├─ App.jsx
│       └─ components/
│           ├─ MoodInput.jsx
│           └─ Player.jsx
│
└─ server/                # Express back‑end
    ├─ index.js
    ├─ moodService.js
    └─ spotify.js
```

## License
MIT – feel free to fork and extend!
