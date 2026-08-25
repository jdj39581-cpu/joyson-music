// server/spotify.js
const axios = require('axios');
require('dotenv').config();

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Obtain or return cached Spotify client credentials access token.
 */
async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn('Spotify Client ID or Secret missing in .env');
    return null;
  }

  try {
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 5000,
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiresAt = now + (response.data.expires_in || 3600) * 1000;
    return cachedToken;
  } catch (err) {
    console.error('Failed to obtain Spotify token:', err.response?.data || err.message);
    return null;
  }
}

/**
 * Search Spotify for playlists matching a query string.
 * Gracefully catches 403 / developer tier restrictions.
 */
async function searchPlaylist(query, token) {
  if (!token) return null;
  try {
    const encoded = encodeURIComponent(query);
    const url = `https://api.spotify.com/v1/search?type=playlist&limit=5&q=${encoded}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    return response.data.playlists;
  } catch (err) {
    console.warn('Spotify search playlist warning:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

/**
 * Get full playlist details by ID.
 */
async function getPlaylistDetails(playlistId, token) {
  if (!token || !playlistId) return null;
  try {
    const url = `https://api.spotify.com/v1/playlists/${playlistId}`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000,
    });
    return response.data;
  } catch (err) {
    console.warn('Spotify playlist details warning:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

module.exports = { getAccessToken, searchPlaylist, getPlaylistDetails };
