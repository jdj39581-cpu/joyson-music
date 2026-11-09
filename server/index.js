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
  getSpotifyPlaylist,
  getSpotifyAuthUrl,
  handleSpotifyCallback,
  getUserSpotifyProfile,
  getUserSpotifyPlaylists,
  refreshUserAccessToken,
  fetchPlaylistsBySpotifyUser
} = require('./spotify');

const app = express();
app.set('trust proxy', 1);
app.use(cors());
app.use(bodyParser.json());

// Serve static React build in production
const distPath = path.join(__dirname, '../client/dist');
app.use('/assets', express.static(path.join(distPath, 'assets'), { maxAge: '1y', immutable: true }));
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
  if (req && req.query && typeof req.query.redirect_uri === 'string' && req.query.redirect_uri.trim()) {
    return req.query.redirect_uri.trim();
  }
  const referer = (req && req.headers ? (req.headers['referer'] || req.headers['origin'] || '') : '');
  const host = (req && req.get ? (req.get('host') || '') : '');
  const isLocal = referer.includes('localhost') || referer.includes('127.0.0.1') || host.includes('localhost') || host.includes('127.0.0.1');

  if (isLocal) {
    let port = '5173';
    if (referer.includes(':4000') || host.includes(':4000')) {
      port = '4000';
    } else if (referer.includes(':5173')) {
      port = '5173';
    }
    return 'http://localhost:' + port + '/api/spotify/callback';
  }

  if (process.env.SPOTIFY_REDIRECT_URI && process.env.SPOTIFY_REDIRECT_URI.trim()) {
    return process.env.SPOTIFY_REDIRECT_URI.trim();
  }

  const protoHeader = req && req.headers ? req.headers['x-forwarded-proto'] : null;
  const protocol = protoHeader ? protoHeader.split(',')[0].trim() : (req && req.protocol ? req.protocol : 'https');
  return protocol + '://' + (host || 'joyson-music.onrender.com') + '/api/spotify/callback';
}

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
// Spotify Account OAuth Auth URL (JSON for SPA clients)
app.get('/api/spotify/auth-url', (req, res) => {
  const redirectUri = resolveSpotifyRedirectUri(req);
  const referer = req.headers['referer'] || '/';
  const statePayload = Buffer.from(JSON.stringify({
    redirectUri,
    returnUrl: referer
  })).toString('base64');
  const authUrl = getSpotifyAuthUrl(redirectUri, statePayload);
  res.json({ authUrl, redirectUri });
});

// Spotify Account OAuth Login (Browser Redirect)
app.get('/api/spotify/login', (req, res) => {
  const redirectUri = resolveSpotifyRedirectUri(req);
  const referer = req.headers['referer'] || '/';
  const statePayload = Buffer.from(JSON.stringify({
    redirectUri,
    returnUrl: referer
  })).toString('base64');
  const url = getSpotifyAuthUrl(redirectUri, statePayload);
  res.redirect(url);
});

// Spotify OAuth Callback Handler
const handleSpotifyCallbackRoute = async (req, res) => {
  const { code, error, state } = req.query;
  let redirectUri = resolveSpotifyRedirectUri(req);
  let returnUrl = '/';

  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      if (decoded.redirectUri) redirectUri = decoded.redirectUri;
      if (decoded.returnUrl) returnUrl = decoded.returnUrl;
    } catch (e) {}
  }

  if (error || !code) {
    const errorTarget = returnUrl.includes('?') ? returnUrl + '&spotify_error=' + encodeURIComponent(error || 'Authorization denied') : returnUrl + '?spotify_error=' + encodeURIComponent(error || 'Authorization denied');
    return res.redirect(errorTarget);
  }

  try {
    const tokenData = await handleSpotifyCallback(code, redirectUri);
    const profile = await getUserSpotifyProfile(tokenData.access_token);
    const playlists = await getUserSpotifyPlaylists(tokenData.access_token);

    const userPayload = encodeURIComponent(JSON.stringify({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresIn: tokenData.expires_in || 3600,
      profile,
      playlists
    }));

    const cleanReturn = returnUrl.split('#')[0];
    res.redirect(cleanReturn + '#spotify_connected=' + userPayload);
  } catch (err) {
    console.error('Spotify callback error:', err.response?.data || err.message);
    const errorTarget = returnUrl.includes('?') ? returnUrl + '&spotify_error=Failed to link Spotify account' : returnUrl + '?spotify_error=Failed to link Spotify account';
    res.redirect(errorTarget);
  }
};

app.get('/api/spotify/callback', handleSpotifyCallbackRoute);
app.get('/callback', handleSpotifyCallbackRoute);

// Refresh Spotify access token using refresh_token
app.post('/api/spotify/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const data = await refreshUserAccessToken(refreshToken);
    res.json({ accessToken: data.access_token, expiresIn: data.expires_in });
  } catch (err) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Import all playlists by Spotify Username / Profile URL without OAuth
app.post('/api/spotify/fetch-by-user', async (req, res) => {
  const { username } = req.body;
  if (!username || !username.trim()) return res.status(400).json({ error: 'Username or profile URL required' });
  try {
    const result = await fetchPlaylistsBySpotifyUser(username.trim());
    res.json(result);
  } catch (err) {
    console.error('fetch-by-user error:', err.message);
    res.status(500).json({ error: err.message || 'Could not fetch playlists for this account' });
  }
});

// Fetch current user's personal playlists with their token
app.get('/api/spotify/user-playlists', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7) : (req.query.token || null);
  if (!token) return res.status(401).json({ error: 'Spotify access token required' });
  try {
    let profile = null;
    try {
      profile = await getUserSpotifyProfile(token);
    } catch (e) {}
    const playlists = await getUserSpotifyPlaylists(token);
    res.json({ profile, playlists });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user Spotify playlists' });
  }
});

// Fetch Spotify user profile
app.get('/api/spotify/user-profile', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7) : (req.query.token || null);
  if (!token) return res.status(401).json({ error: 'Spotify access token required' });
  try {
    const profile = await getUserSpotifyProfile(token);
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Disconnect Spotify endpoint
app.post('/api/spotify/disconnect', (req, res) => {
  res.json({ success: true, message: 'Disconnected' });
});

// Fetch official or personal Spotify Playlist directly by ID
app.get('/api/spotify/playlist/:id', async (req, res) => {
  const { id } = req.params;
  const authHeader = req.headers['authorization'];
  const token = (authHeader && authHeader.startsWith('Bearer ')) ? authHeader.slice(7) : (req.query.token || null);

  if (!id || !id.trim()) {
    return res.status(400).json({ error: 'Spotify playlist ID is required' });
  }

  try {
    const playlist = await getSpotifyPlaylist(id.trim(), token);
    res.json({ playlist });
  } catch (err) {
    console.error('Spotify playlist fetch error:', err.message);
    res.status(500).json({ error: 'Could not fetch Spotify playlist' });
  }
});

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
  if (req.path.startsWith('/api/') || req.path.startsWith('/assets/')) {
    return res.status(404).send('Not Found');
  }
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AuraBeat Server listening on http://0.0.0.0:${PORT} (Local, Mobile & Cloud)`);
});
