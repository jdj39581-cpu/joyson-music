// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');
const path = require('path');
const { 
  analyzeMoodAndRecommend, 
  getMoreTracks, 
  getCandidateVideoIds, 
  fetchRealTrackAudio, 
  fetchTrackLyrics,
  searchLiveMusicCatalog,
  searchUniversalMusicCatalog,
  SONG_DATABASE 
} = require('./moodService');
const { 
  getAccessToken,
  importSpotifyPlaylist,
  getSpotifyAuthUrl,
  handleSpotifyCallback,
  getUserSpotifyProfile,
  getUserSpotifyPlaylists
} = require('./spotify');

const app = express();
app.set('trust proxy', 1);
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

// Endpoint to resolve synchronized karaoke lyrics
app.get('/api/lyrics', async (req, res) => {
  const { title, artist } = req.query;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const lyrics = await fetchTrackLyrics(title, artist || '');
    res.json({ lyrics });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch lyrics' });
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

// Helper to reliably construct or override Spotify OAuth Redirect URI
function resolveSpotifyRedirectUri(req) {
  if (process.env.SPOTIFY_REDIRECT_URI && process.env.SPOTIFY_REDIRECT_URI.trim()) {
    return process.env.SPOTIFY_REDIRECT_URI.trim();
  }
  const protoHeader = req.headers['x-forwarded-proto'];
  const host = req.get('host') || 'joyson-music.onrender.com';
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
  const protocol = isLocal ? 'http' : (protoHeader ? protoHeader.split(',')[0].trim() : req.protocol || 'https');
  return `${protocol}://${host}/api/spotify/callback`;
}

// Spotify OAuth Configuration Info Endpoint (used by frontend to show exact callback URL)
app.get('/api/spotify/config', (req, res) => {
  const redirectUri = resolveSpotifyRedirectUri(req);
  const clientId = process.env.SPOTIFY_CLIENT_ID || '83259f32ab8246e5b33fd0b0789437b2';
  res.json({
    clientId,
    redirectUri,
    dashboardUrl: `https://developer.spotify.com/dashboard`
  });
});

// Spotify Account OAuth Login
app.get('/api/spotify/login', (req, res) => {
  const redirectUri = resolveSpotifyRedirectUri(req);
  const url = getSpotifyAuthUrl(redirectUri);
  res.redirect(url);
});

// Spotify OAuth Callback Handler
const handleSpotifyCallbackRoute = async (req, res) => {
  const { code, error } = req.query;
  const redirectUri = resolveSpotifyRedirectUri(req);

  if (error || !code) {
    return res.redirect('/?spotify_error=' + encodeURIComponent(error || 'Authorization denied'));
  }

  try {
    const tokenData = await handleSpotifyCallback(code, redirectUri);
    const profile = await getUserSpotifyProfile(tokenData.access_token);
    const playlists = await getUserSpotifyPlaylists(tokenData.access_token);

    const userPayload = encodeURIComponent(JSON.stringify({
      accessToken: tokenData.access_token,
      profile,
      playlists
    }));

    res.redirect(`/#spotify_connected=${userPayload}`);
  } catch (err) {
    console.error('Spotify callback error:', err.response?.data || err.message);
    res.redirect('/?spotify_error=Failed to link Spotify account');
  }
};

app.get('/api/spotify/callback', handleSpotifyCallbackRoute);
app.get('/callback', handleSpotifyCallbackRoute);

// Import ANY Spotify Playlist by URL or ID (Public / User shared playlist)
app.post('/api/spotify/import', async (req, res) => {
  const { url } = req.body;
  if (!url || !url.trim()) {
    return res.status(400).json({ error: 'Spotify playlist URL is required' });
  }

  try {
    const playlist = await importSpotifyPlaylist(url.trim());
    res.json({ playlist });
  } catch (err) {
    console.error('Spotify import error:', err.message);
    res.status(500).json({ error: 'Could not import Spotify playlist. Check the URL and try again.' });
  }
});

// Live search endpoint across literally all songs in YouTube, Spotify & Universal Catalog
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) return res.json({ results: [] });

  try {
    const results = await searchUniversalMusicCatalog(q.trim(), 40);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Main mood playlist recommendation endpoint
app.post('/api/playlist', async (req, res) => {
  const { mood, shuffle } = req.body;
  if (!mood || typeof mood !== 'string') {
    return res.status(400).json({ error: 'Mood query is required' });
  }

  try {
    const aiResult = await analyzeMoodAndRecommend(mood.trim(), { shuffle: !!shuffle });
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
