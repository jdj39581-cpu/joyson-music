// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');
const path = require('path');
const { analyzeMoodAndRecommend, getMoreTracks, getCandidateVideoIds, fetchRealTrackAudio } = require('./moodService');
const { getAccessToken } = require('./spotify');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static React build in production
const distPath = path.join(__dirname, '../client/dist');
app.use(express.static(distPath));

// Proactively warm up Spotify token on launch
getAccessToken().catch(e => console.warn('Spotify initial auth check:', e.message));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Helper endpoint to give frontend the machine's local Wi-Fi IP for mobile QR code
app.get('/api/network-info', (req, res) => {
  const interfaces = os.networkInterfaces();
  let localIp = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIp = iface.address;
        break;
      }
    }
  }
  res.json({ localIp, port: 5173, mobileUrl: `http://${localIp}:5173` });
});

// Fast endpoint to resolve high-fidelity audio stream and artwork in <100ms
app.get('/api/track-audio', async (req, res) => {
  const { title, artist } = req.query;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const audioData = await fetchRealTrackAudio(title, artist || '');
    res.json(audioData);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch track audio' });
  }
});

// Endpoint to resolve YouTube Video IDs on demand
app.get('/api/candidate-videos', async (req, res) => {
  const { title, artist } = req.query;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const videoIds = await getCandidateVideoIds(title, artist || '');
    res.json({ videoIds, videoId: videoIds[0] || null });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch candidate video IDs' });
  }
});

// Main mood playlist recommendation endpoint
app.post('/api/playlist', async (req, res) => {
  const { mood } = req.body;
  if (!mood || typeof mood !== 'string') {
    return res.status(400).json({ error: 'Mood query is required' });
  }

  try {
    const aiResult = await analyzeMoodAndRecommend(mood.trim());
    const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(aiResult.spotifySearchQuery || mood)}`;

    const response = {
      mood: mood.trim(),
      vibeTitle: aiResult.vibeTitle,
      vibeDescription: aiResult.vibeDescription,
      emoji: aiResult.emoji,
      genre: aiResult.genre,
      energy: aiResult.energy,
      colorTheme: aiResult.colorTheme,
      playlistEmbedId: aiResult.playlistEmbedId || '37i9dQZF1DX0XUfTFmZeZw',
      spotifyUrl,
      tracks: aiResult.tracks || [],
    };

    res.json(response);
  } catch (err) {
    console.error('Error handling /api/playlist:', err);
    res.status(500).json({ error: 'Could not generate mood playlist. Please try again.' });
  }
});

// Endpoint to fetch more unique tracks for the current mood
app.post('/api/more-tracks', async (req, res) => {
  const { mood, existingTitles } = req.body;
  if (!mood) {
    return res.status(400).json({ error: 'Mood is required' });
  }

  try {
    const newTracks = await getMoreTracks(mood, existingTitles || []);
    res.json({ tracks: newTracks });
  } catch (err) {
    console.error('Error handling /api/more-tracks:', err);
    res.status(500).json({ error: 'Failed to load more tracks' });
  }
});

// Fallback for SPA routing in production
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AuraBeat Server listening on http://0.0.0.0:${PORT} (Local, Mobile & Cloud)`);
});
