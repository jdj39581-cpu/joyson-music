// server/moodService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

// Fallback official verified public Spotify playlist IDs
const POPULAR_PLAYLIST_FALLBACKS = {
  chill: "37i9dQZF1DX4WYpdgoIcn6",
  lofi: "37i9dQZF1DXdLEN7aqioXM",
  focus: "37i9dQZF1DX1s9knjP51Oa",
  happy: "37i9dQZF1DX3rxVfibe1L0",
  energetic: "37i9dQZF1DX76Wlfdnj7AP",
  sad: "37i9dQZF1DX7qK8ma5wgG1",
  party: "37i9dQZF1DX0XUsuxWHRQd",
  sleep: "37i9dQZF1DX4sWSpwq3LiO",
  retro: "37i9dQZF1DXd9rSDyQguIk",
  bollywood: "37i9dQZF1DX0XUfTFmZeZw",
  kannada: "37i9dQZF1DX14Et21j0Z6B",
  konkani: "37i9dQZF1DX5Y84XzFhZ6V",
  punjabi: "37i9dQZF1DX48MRot5PzC8",
  tamil: "37i9dQZF1DX47bg230p1vS",
  telugu: "37i9dQZF1DX7aJu0h8j4gP",
  malayalam: "37i9dQZF1DX11qm8g1tW12",
  acoustic: "37i9dQZF1DX50QitC6Oqtn",
};

// Normalized title matcher to prevent duplicate songs
function normalizeTitle(str) {
  return (str || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function isDuplicate(title, existingSet) {
  const norm = normalizeTitle(title);
  if (!norm) return false;
  for (const ex of existingSet) {
    if (ex === norm || (ex.length > 4 && norm.length > 4 && (ex.includes(norm) || norm.includes(ex)))) {
      return true;
    }
  }
  return false;
}

// Rich curated database for fallback & enrichment
const SONG_DATABASE = {
  konkani: [
    { title: 'Mog Asom', artist: 'Lawry Travasso', reason: 'Timeless Goan Konkani romantic classic' },
    { title: 'Bebdo', artist: 'Lorna Cordeiro', reason: 'Legendary upbeat Goan jazz-konkani anthem' },
    { title: 'Maria Pitache', artist: 'Remo Fernandes', reason: 'Iconic energetic Goan pop-folk dance' },
    { title: 'Ye Ye Katrina', artist: 'Henry D\'Souza', reason: 'All-time famous Mangalorean Konkani baila hit' },
    { title: 'Daryacha Larani', artist: 'Wilfy Rebimbus', reason: 'Soulful coastal romantic melody' },
    { title: 'Claudia', artist: 'Chris Perry, Lorna', reason: 'Nostalgic romantic brass jazz melody' },
    { title: 'Hanv Saiba Poltodi Vetam', artist: 'Goan Heritage Troupe', reason: 'Traditional Goan mando folk song' },
    { title: 'Sanjecho Vell', artist: 'Lorna Cordeiro', reason: 'Melodious romantic sunset ballad' },
    { title: 'Undir Mhozo Mama', artist: 'Remo Fernandes', reason: 'Playful upbeat Goan folk song' },
    { title: 'Tuzo Mog', artist: 'Oswald D\'Souza', reason: 'Romantic melody expressing deep love' },
    { title: 'Sopon', artist: 'Melwyn Peris', reason: 'Heartwarming Mangalorean Konkani love track' },
    { title: 'Tukach Lagun', artist: 'Nephie Rod', reason: 'Soulful acoustic Konkani feel' },
    { title: 'Yo Moga', artist: 'Prajoth D\'Sa', reason: 'Modern acoustic Konkani indie pop' },
    { title: 'Mogachi Bhes', artist: 'Wilfy Rebimbus', reason: 'Classic romantic duet' },
    { title: 'Pisso', artist: 'Lorna Cordeiro', reason: 'High energy soulful vocal track' },
    { title: 'Noxibak Roddtam', artist: 'Alfred Rose', reason: 'Sentimental emotional Konkani classic' },
    { title: 'Amerikak Pavlo', artist: 'C. Alvares', reason: 'Humorous upbeat Konkani song' },
    { title: 'Rosalina', artist: 'Chris Perry', reason: 'Catchy danceable Goan melody' },
    { title: 'Ami Goenkar', artist: 'Goan All Stars', reason: 'Proud celebration of Goan identity' },
    { title: 'Chonknna', artist: 'Goa Brass Band', reason: 'Festive wedding baila dance groove' },
    { title: 'Udi Udi', artist: 'Prajoth D\'Sa', reason: 'Breezy modern Konkani romantic track' },
    { title: 'Kalliz Suker', artist: 'Lorna', reason: 'Deep emotional ballad' },
    { title: 'Mhojea Kudant', artist: 'Henry D\'Souza', reason: 'Classic coastal Konkani tune' },
    { title: 'Goenchi Mati', artist: 'Alfred Rose', reason: 'Heartfelt ode to the land of Goa' }
  ],
  kannada: [
    { title: 'Singara Siriye', artist: 'Vijay Prakash, Ananya Bhat', reason: 'Romantic folk sensation from Kantara' },
    { title: 'Ra Ra Rakkamma', artist: 'Sunidhi Chauhan, Nakash Aziz', reason: 'High energy dance track from Vikrant Rona' },
    { title: 'Belakina Kavidhe', artist: 'Sanjith Hegde', reason: 'Soothing romantic melody from Bell Bottom' },
    { title: 'Tagaru Banthu Tagaru', artist: 'Anthony Daasan', reason: 'High-octane mass anthem' },
    { title: 'Dheera Dheera', artist: 'Ananya Bhat', reason: 'Powerful mass anthem from KGF' },
    { title: 'Mehabooba', artist: 'Ananya Bhat', reason: 'Soulful melody from KGF Chapter 2' },
    { title: 'Karabuu', artist: 'Chandan Shetty', reason: 'Fast paced mass dance beat from Pogaru' },
    { title: 'Ondu Malebillu', artist: 'Armaan Malik, Shreya Ghoshal', reason: 'Romantic melody from Chakravarthy' },
    { title: 'Ninna Gungalli', artist: 'Sanjith Hegde', reason: 'Youthful upbeat romantic groove' },
    { title: 'Anisuthide', artist: 'Sonu Nigam', reason: 'All-time classic melody from Mungaru Male' },
    { title: 'Minchagi Neenu', artist: 'Sonu Nigam', reason: 'Iconic romantic melody from Gaalipata' },
    { title: 'Neene Modalu', artist: 'Shreya Ghoshal', reason: 'Heartwarming melody from Kiss' },
    { title: 'Sulthana', artist: 'K.G.F Chapter 2 Team', reason: 'High voltage hype track' },
    { title: 'Salaam Rocky Bhai', artist: 'Vijay Prakash', reason: 'Mass anthem from KGF' },
    { title: 'Soul of Dia', artist: 'Sanjith Hegde', reason: 'Deep emotional acoustic feel' },
    { title: 'Hands Up', artist: 'Vijay Prakash', reason: 'Fun energetic party beat from Avane Srimannarayana' },
    { title: 'Geleya Geleya', artist: 'Jr NTR, S. Thaman', reason: 'High-energy friendship anthem' },
    { title: 'Natasaarvabhowma', artist: 'Sanjith Hegde', reason: 'Upbeat power dance track' },
    { title: 'Varaha Roopam', artist: 'Sai Vignesh', reason: 'Spiritual divine folk energy from Kantara' },
    { title: 'Kantara Theme', artist: 'B. Ajaneesh Loknath', reason: 'Tribal percussion rhythm' },
    { title: 'Ondu Sanje', artist: 'Sonu Nigam', reason: 'Romantic nostalgic feel from Geetha' },
    { title: 'Mungaru Maleye', artist: 'Sonu Nigam', reason: 'Classic rain melody' },
    { title: 'Yenammi Yenammi', artist: 'Vijay Prakash, Palak Muchhal', reason: 'Sweet romantic rustic melody from Ayogya' },
    { title: 'Chuttu Chuttu', artist: 'Ravindra Soragavi, Shamitha Malnad', reason: 'Blockbuster viral dance track' },
    { title: 'Party Freak', artist: 'Chandan Shetty', reason: 'High energy party club banger' },
    { title: 'Tappanguchi', artist: 'Shashank Sheshagiri', reason: 'Upbeat local folk dance' },
    { title: 'Self Made', artist: 'Chandan Shetty', reason: 'Hip hop motivational track' },
    { title: 'Alemaariye', artist: 'Sanjith Hegde', reason: 'Breezy acoustic indie feel' },
    { title: 'Baanadariyalli', artist: 'Shreya Ghoshal', reason: 'Heart-touching melody' },
    { title: 'Usire Usire', artist: 'Hariharan', reason: 'Timeless soulful melody from Huchcha' },
    { title: 'Bombe Heluthaithe', artist: 'Vijay Prakash', reason: 'Emotional Rajakumara anthem' },
    { title: 'Appu Dance', artist: 'Puneeth Rajkumar', reason: 'Legendary celebratory dance' }
  ],
  hindi: [
    { title: 'London Thumakda', artist: 'Labh Janjua, Sonu Kakkar, Neha Kakkar', reason: 'Festive wedding dance energy from Queen' },
    { title: 'Ghungroo', artist: 'Arijit Singh, Shilpa Rao', reason: 'Modern Hindi dance groove from War' },
    { title: 'Kar Gayi Chull', artist: 'Badshah, Neha Kakkar', reason: 'Bollywood party beat' },
    { title: 'Gallan Goodiyaan', artist: 'Shankar Mahadevan, Yashita Sharma', reason: 'Celebratory Hindi anthem' },
    { title: 'Nashe Si Chadh Gayi', artist: 'Arijit Singh', reason: 'Catchy melodic dance rhythms' },
    { title: 'Badtameez Dil', artist: 'Benny Dayal', reason: 'Fast paced dance energy from Yeh Jawaani Hai Deewani' },
    { title: 'Aankh Marey', artist: 'Neha Kakkar, Mika Singh', reason: 'Energetic dance party track' },
    { title: 'Kala Chashma', artist: 'Amar Arshi, Badshah', reason: 'Sensational Bollywood dance number' },
    { title: 'Abhi Toh Party Shuru Hui Hai', artist: 'Badshah', reason: 'Classic Hindi club party banger' },
    { title: 'What Jhumka ?', artist: 'Arijit Singh, Jonita Gandhi', reason: 'Playful romantic dance track' },
    { title: 'Ilahi', artist: 'Arijit Singh', reason: 'Uplifting travel acoustic feel' },
    { title: 'Subha Hone Na De', artist: 'Mika Singh, Shefali Alvares', reason: 'High-octane club dance anthem' },
    { title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao', reason: 'Romantic upbeat groove from Jawan' },
    { title: 'Jhoome Jo Pathaan', artist: 'Arijit Singh, Sukriti Kakar', reason: 'High energy dance track' },
    { title: 'Tere Bina', artist: 'A.R. Rahman, Chinmayi', reason: 'Soulful romantic melody from Guru' },
    { title: 'Tum Se', artist: 'Sachin-Jigar, Raghav Chaitanya', reason: 'Melodious romantic feel' },
    { title: 'Kesariya', artist: 'Arijit Singh, Pritam', reason: 'Heartwarming love song' },
    { title: 'Zinda Banda', artist: 'Anirudh Ravichander', reason: 'High-energy celebration track' },
    { title: 'Lungi Dance', artist: 'Yo Yo Honey Singh', reason: 'Fun iconic party anthem' },
    { title: 'Dil Diyan Gallan', artist: 'Atif Aslam', reason: 'Soulful romantic melody' },
    { title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', reason: 'Heart-touching romantic track' },
    { title: 'Garmi', artist: 'Badshah, Neha Kakkar', reason: 'High energy club dance track' },
    { title: 'Malhari', artist: 'Vishal Dadlani', reason: 'Electrifying victory dance anthem' },
    { title: 'Senorita', artist: 'Farhan Akhtar, Hrithik Roshan', reason: 'Fun Spanish-Bollywood acoustic groove' },
    { title: 'Sooraj Dooba Hain', artist: 'Arijit Singh, Aditi Singh Sharma', reason: 'Euphoric sunset EDM party anthem' }
  ],
  english: [
    { title: 'Blinding Lights', artist: 'The Weeknd', reason: 'Electrifying 80s synth-pop drive' },
    { title: 'Levitating', artist: 'Dua Lipa', reason: 'Groovy disco-pop energy' },
    { title: 'Starboy', artist: 'The Weeknd, Daft Punk', reason: 'Driving electro-R&B anthem' },
    { title: 'Midnight City', artist: 'M83', reason: 'Soaring euphoric synth energy' },
    { title: 'Wake Me Up', artist: 'Avicii', reason: 'Timeless festival anthem' },
    { title: 'As It Was', artist: 'Harry Styles', reason: 'Upbeat indie-pop groove' },
    { title: 'Save Your Tears', artist: 'The Weeknd', reason: 'Catchy synthwave rhythm' },
    { title: 'Shape of You', artist: 'Ed Sheeran', reason: 'Rhythmic global pop melody' },
    { title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', reason: 'High energy modern pop-rock' },
    { title: 'Sunroof', artist: 'Nicky Youre, dazy', reason: 'Feel-good sunny day summer vibes' },
    { title: 'Cold Heart', artist: 'Elton John, Dua Lipa', reason: 'Smooth danceable disco groove' },
    { title: 'Something Just Like This', artist: 'The Chainsmokers, Coldplay', reason: 'Euphoric electronic-pop anthem' },
    { title: 'Dance Monkey', artist: 'Tones and I', reason: 'Catchy upbeat indie pop' },
    { title: 'Flowers', artist: 'Miley Cyrus', reason: 'Empowering feel-good pop anthem' },
    { title: 'Watermelon Sugar', artist: 'Harry Styles', reason: 'Breezy summer acoustic groove' },
    { title: 'Counting Stars', artist: 'OneRepublic', reason: 'Uplifting folk-pop drive' },
    { title: 'Can\'t Stop the Feeling!', artist: 'Justin Timberlake', reason: 'Pure joy and celebration' },
    { title: 'Uptown Funk', artist: 'Mark Ronson, Bruno Mars', reason: 'High-energy funk party banger' }
  ]
};

/**
 * High-Precision YouTube Video ID Extractor
 */
async function getCandidateVideoIds(title, artist = '') {
  const primaryArtist = (artist || '').split(',')[0].split('&')[0].trim();
  const q = `${title} ${primaryArtist} official song`;
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 3500,
    });

    const html = res.data;
    const regex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const ids = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const id = match[1];
      if (!ids.includes(id)) {
        ids.push(id);
      }
      if (ids.length >= 4) break;
    }

    if (ids.length === 0) {
      const fallbackRegex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
      while ((match = fallbackRegex.exec(html)) !== null) {
        const id = match[1];
        if (!ids.includes(id)) {
          ids.push(id);
        }
        if (ids.length >= 4) break;
      }
    }

    return ids.slice(0, 4);
  } catch (err) {
    return [];
  }
}

/**
 * Live search from global catalog (Apple Music/iTunes API with 100M+ songs)
 */
async function searchLiveMusicCatalog(query, country = 'IN', limit = 30) {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&country=${country}&entity=song&limit=${limit}`;
    const res = await axios.get(url, { timeout: 3500 });
    const results = res.data?.results || [];

    return results.map(r => {
      const durationMs = r.trackTimeMillis || 0;
      const mins = Math.floor(durationMs / 60000);
      const secs = Math.floor((durationMs % 60000) / 1000);
      const durationFormatted = durationMs > 0 ? `${mins}:${secs < 10 ? '0' : ''}${secs}` : '3:30';

      return {
        title: r.trackName,
        artist: r.artistName,
        album: r.collectionName || '',
        duration: durationFormatted,
        reason: 'Trending track from live music catalog',
        artworkUrl: r.artworkUrl100 ? r.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg') : null,
        previewUrl: r.previewUrl || null,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(r.trackName + ' ' + r.artistName)}`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(r.trackName + ' ' + r.artistName + ' official song')}`,
        appleMusicUrl: r.trackViewUrl || null,
        candidateVideoIds: [],
        youtubeVideoId: null,
      };
    });
  } catch (err) {
    return [];
  }
}

/**
 * Fetch official artwork and song details from iTunes/Apple Music.
 */
async function fetchRealTrackAudio(title, artist = '') {
  const primaryArtist = artist.split(',')[0].split('&')[0].trim();
  const searchQueries = [
    `${title} ${primaryArtist}`,
    `${title} ${artist}`.trim(),
    title.trim(),
  ];

  for (const q of searchQueries) {
    if (!q) continue;
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=3`;
      const res = await axios.get(url, { timeout: 3000 });
      const results = res.data?.results || [];

      const match = results.find(r => r.previewUrl) || results[0];

      if (match) {
        const artwork = match.artworkUrl100
          ? match.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg')
          : null;

        const durationMs = match.trackTimeMillis || 0;
        const mins = Math.floor(durationMs / 60000);
        const secs = Math.floor((durationMs % 60000) / 1000);
        const durationFormatted = durationMs > 0 ? `${mins}:${secs < 10 ? '0' : ''}${secs}` : null;

        return {
          realTitle: match.trackName || title,
          realArtist: match.artistName || artist,
          album: match.collectionName || '',
          artworkUrl: artwork,
          previewUrl: match.previewUrl || null,
          duration: durationFormatted,
          appleMusicUrl: match.trackViewUrl || null,
        };
      }
    } catch (err) {
      // Continue
    }
  }

  return {
    realTitle: title,
    realArtist: artist,
    album: '',
    artworkUrl: null,
    previewUrl: null,
    duration: null,
    appleMusicUrl: null,
  };
}

/**
 * Enrich tracks with verified YouTube Video IDs, artwork, duration, and streaming links
 */
async function enrichTracksWithRealAudio(tracks) {
  return Promise.all(
    tracks.map(async (t) => {
      const [realAudio, candidateVideoIds] = await Promise.all([
        t.previewUrl ? Promise.resolve(t) : fetchRealTrackAudio(t.title, t.artist),
        (t.candidateVideoIds && t.candidateVideoIds.length > 0) ? Promise.resolve(t.candidateVideoIds) : getCandidateVideoIds(t.title, t.artist),
      ]);

      const songTitle = realAudio.realTitle || t.title;
      const songArtist = realAudio.realArtist || t.artist;
      const ytVideoId = (candidateVideoIds && candidateVideoIds.length > 0) ? candidateVideoIds[0] : (t.youtubeVideoId || null);
      const ytQuery = encodeURIComponent(`${songTitle} ${songArtist} official song`);

      return {
        title: songTitle,
        artist: songArtist,
        album: realAudio.album || t.album || '',
        duration: realAudio.duration || t.duration || '3:45',
        reason: t.reason || '',
        artworkUrl: realAudio.artworkUrl || t.artworkUrl || null,
        previewUrl: realAudio.previewUrl || t.previewUrl || null,
        youtubeVideoId: ytVideoId,
        candidateVideoIds: candidateVideoIds || [],
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(songTitle + ' ' + songArtist)}`,
        youtubeUrl: ytVideoId 
          ? `https://www.youtube.com/watch?v=${ytVideoId}` 
          : `https://www.youtube.com/results?search_query=${ytQuery}`,
        appleMusicUrl: realAudio.appleMusicUrl || t.appleMusicUrl || null,
      };
    })
  );
}

/**
 * Intelligent AI analysis of user mood and STRICT language matching (including Konkani)
 */
async function analyzeMoodAndRecommend(mood) {
  let baseData = null;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const prompt = `
You are an expert music curator and AI DJ named AuraBeat.
Analyze the user mood or language query: "${mood}".

CRITICAL LANGUAGE ENFORCEMENT RULES:
1. If the user mentions ANY language or regional industry:
   - "Konkani" / "Goan" / "Mangalorean": ALL 12 songs MUST be 100% Konkani songs (e.g. Lorna, Chris Perry, Remo Fernandes, Wilfy Rebimbus, Henry D'Souza, Prajoth D'Sa, Lawry Travasso, Alfred Rose).
   - "Kannada" / "Sandalwood": ALL 12 songs MUST be 100% Kannada songs (e.g. Singara Siriye, Ra Ra Rakkamma, Belakina Kavidhe, Tagaru, Karabuu, Dheera Dheera, Neene Modalu, Ondu Malebillu, Minchagi Neenu, Anisuthide).
   - "Hindi" / "Bollywood": ALL 12 songs MUST be 100% Hindi/Bollywood songs (e.g. Arijit Singh, Badshah, Shreya Ghoshal, Neha Kakkar, Pritam, Atif Aslam).
   - "English": ALL 12 songs MUST be 100% English songs (e.g. The Weeknd, Dua Lipa, Harry Styles, Taylor Swift, Coldplay).
2. If no language is specified, match the natural style and vibe of the input prompt.

Respond with ONLY a raw JSON object:
{
  "vibeTitle": "A creative title (3-6 words)",
  "vibeDescription": "A 1-2 sentence explanation.",
  "emoji": "2 emojis",
  "genre": "Primary music genre",
  "energy": "Energy level with %",
  "colorTheme": ["#fromHexColor", "#toHexColor"],
  "spotifySearchQuery": "concise search query for Spotify",
  "spotifyPlaylistCategory": "one of: chill, lofi, focus, happy, energetic, sad, party, sleep, retro, bollywood, kannada, konkani, punjabi, tamil, telugu, malayalam, acoustic",
  "tracks": [
    {
      "title": "Real Song Title",
      "artist": "Real Artist Name",
      "reason": "Short reason"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      baseData = JSON.parse(cleaned);
    } catch (err) {
      console.warn('Gemini API notice, using curated collection:', err.message);
      baseData = generateFallbackRecommendations(mood);
    }
  } else {
    baseData = generateFallbackRecommendations(mood);
  }

  const rawTracks = baseData.tracks || [];
  const enrichedTracks = await enrichTracksWithRealAudio(rawTracks);

  const category = baseData.spotifyPlaylistCategory || 'chill';
  const playlistEmbedId = POPULAR_PLAYLIST_FALLBACKS[category] || POPULAR_PLAYLIST_FALLBACKS.chill;
  const vibeTitle = baseData.vibeTitle || `${mood.charAt(0).toUpperCase() + mood.slice(1)} Flow`;

  const spotifySearchQuery = baseData.spotifySearchQuery || mood;
  const spotifyUrl = `https://open.spotify.com/search/${encodeURIComponent(spotifySearchQuery)}`;

  return {
    vibeTitle,
    vibeDescription: baseData.vibeDescription || `Curated soundscape crafted for your ${mood} mood.`,
    emoji: baseData.emoji || '🎵✨',
    genre: baseData.genre || 'Music Collection',
    energy: baseData.energy || '80% Vibrant',
    colorTheme: Array.isArray(baseData.colorTheme) && baseData.colorTheme.length === 2 ? baseData.colorTheme : ['#6366f1', '#a855f7'],
    spotifySearchQuery,
    playlistEmbedId,
    spotifyUrl,
    tracks: enrichedTracks,
  };
}

/**
 * Fetch INFINITE UNIQUE SONGS on "Load More" without running out at 40!
 */
async function getMoreTracks(mood, existingTitles = []) {
  const normalizedExisting = new Set((existingTitles || []).map(t => normalizeTitle(t)));
  const lower = (mood || '').toLowerCase();

  const isKonkani = lower.includes('konkani') || lower.includes('goa') || lower.includes('mangalore');
  const isKannada = lower.includes('kannada') || lower.includes('sandalwood');
  const isHindi = lower.includes('hindi') || lower.includes('bollywood') || lower.includes('desi');
  const isEnglish = lower.includes('english') || lower.includes('pop') || lower.includes('western');

  // 1. Dynamic AI expansion with diverse prompt seeding
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
      const excludeStr = existingTitles.slice(-40).join(', ');
      const seedOffsets = ['undiscovered gem', 'chart-topping hit', 'classic anthem', 'viral sensation', 'dance floor banger', 'acoustic masterpiece'];
      const randomSeed = seedOffsets[Math.floor(Math.random() * seedOffsets.length)];

      const prompt = `
Target Mood & Language: "${mood}".
Requirement: Recommend 12 MORE unique, distinct, real songs matching "${mood}" with a focus on ${randomSeed}.
If a regional language (Konkani, Kannada, Hindi, English) was requested, 100% of songs MUST be strictly in that language.
CRITICAL: Do NOT repeat ANY of these songs: [${excludeStr}].

Respond with ONLY a raw JSON object:
{
  "tracks": [
    {
      "title": "Real Song Title",
      "artist": "Real Artist Name",
      "reason": "Short reason"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
      const data = JSON.parse(cleaned);

      if (data.tracks && data.tracks.length > 0) {
        const uniqueFromAI = data.tracks.filter(t => !isDuplicate(t.title, normalizedExisting));
        if (uniqueFromAI.length > 0) {
          const enriched = await enrichTracksWithRealAudio(uniqueFromAI);
          const finalClean = enriched.filter(t => !isDuplicate(t.title, normalizedExisting));
          if (finalClean.length >= 4) return finalClean;
        }
      }
    } catch (err) {
      console.warn('AI more tracks notice:', err.message);
    }
  }

  // 2. Multi-query rotating live catalog search for unlimited song loading
  try {
    const searchTerms = [];
    let country = 'IN';

    if (isKonkani) {
      searchTerms.push('Konkani', 'Goan Konkani', 'Lorna Konkani', 'Wilfy Rebimbus', 'Mangalore Konkani', 'Remo Fernandes', 'Konkani Baila', 'Chris Perry');
      country = 'IN';
    } else if (isKannada) {
      searchTerms.push('Kannada Hits', 'Kannada Romantic', 'Sanjith Hegde', 'Vijay Prakash', 'Chandan Shetty', 'Kantara Songs', 'Sonu Nigam Kannada', 'Kannada Dance Hits');
      country = 'IN';
    } else if (isHindi) {
      searchTerms.push('Bollywood Hits', 'Arijit Singh', 'Badshah Hits', 'Hindi Romantic Melodies', 'Hindi Dance Party', 'Pritam Hits', 'Shreya Ghoshal Hindi', 'Bollywood Dance 2024');
      country = 'IN';
    } else if (isEnglish) {
      searchTerms.push('Pop Hits 2024', 'The Weeknd', 'Dua Lipa', 'Billboard Hot 100', 'Top Global Hits', 'Synthwave Hits', 'Dance Pop Hits', 'Ed Sheeran');
      country = 'US';
    } else {
      searchTerms.push(mood, `${mood} music`, `${mood} songs`, 'Top Trending Music');
      country = 'IN';
    }

    // Pick 2 random rotating search queries from the term pool
    const term1 = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const term2 = searchTerms[Math.floor(Math.random() * searchTerms.length)];

    const [batch1, batch2] = await Promise.all([
      searchLiveMusicCatalog(term1, country, 30),
      searchLiveMusicCatalog(term2, country, 30),
    ]);

    const combined = [...batch1, ...batch2];
    const uniqueLive = combined.filter(t => !isDuplicate(t.title, normalizedExisting));

    if (uniqueLive.length >= 3) {
      const enrichedLive = await enrichTracksWithRealAudio(uniqueLive.slice(0, 10));
      return enrichedLive.filter(t => !isDuplicate(t.title, normalizedExisting));
    }
  } catch (e) {
    console.warn('Catalog expansion notice:', e.message);
  }

  // 3. Curated Database pool fallback
  let pool = SONG_DATABASE.english;
  if (isKonkani) pool = SONG_DATABASE.konkani;
  else if (isKannada) pool = SONG_DATABASE.kannada;
  else if (isHindi) pool = SONG_DATABASE.hindi;

  const unplayed = pool.filter(s => !isDuplicate(s.title, normalizedExisting));
  if (unplayed.length > 0) {
    const enriched = await enrichTracksWithRealAudio(unplayed.slice(0, 10));
    return enriched.filter(s => !isDuplicate(s.title, normalizedExisting));
  }

  return [];
}

/**
 * Fallback recommendation generator with Konkani
 */
function generateFallbackRecommendations(mood) {
  const lower = (mood || 'chill').toLowerCase();
  let category = 'chill';
  let colorTheme = ['#06b6d4', '#3b82f6'];
  let emoji = '🌊🎧';
  let genre = 'Chill & Ambient';
  let energy = '60% Relaxed';

  const isKonkani = lower.includes('konkani') || lower.includes('goa') || lower.includes('mangalore');
  const isKannada = lower.includes('kannada') || lower.includes('sandalwood');
  const isHindi = lower.includes('hindi') || lower.includes('bollywood') || lower.includes('desi');

  if (isKonkani) {
    category = 'konkani';
    colorTheme = ['#10b981', '#06b6d4'];
    emoji = '🌴🌊';
    genre = 'Konkani Hits';
    energy = '85% Coastal Vibe';
    return {
      vibeTitle: `Konkani Coastal Classics`,
      vibeDescription: `Pure 100% authentic Goan & Mangalorean Konkani songs for your ${mood} mood.`,
      emoji,
      genre,
      energy,
      colorTheme,
      spotifySearchQuery: `Konkani ${mood} Songs`,
      spotifyPlaylistCategory: category,
      tracks: SONG_DATABASE.konkani.slice(0, 12),
    };
  }

  if (isKannada) {
    category = 'kannada';
    colorTheme = ['#eab308', '#dc2626'];
    emoji = '🟡❤️';
    genre = 'Kannada Hits';
    energy = '92% Sandalwood Power';
    return {
      vibeTitle: `Kannada Superhits`,
      vibeDescription: `Pure 100% Kannada top chartbusters for your ${mood} mood.`,
      emoji,
      genre,
      energy,
      colorTheme,
      spotifySearchQuery: `Kannada ${mood} Hits`,
      spotifyPlaylistCategory: category,
      tracks: SONG_DATABASE.kannada.slice(0, 12),
    };
  }

  if (isHindi) {
    category = 'bollywood';
    colorTheme = ['#f59e0b', '#ef4444'];
    emoji = '🇮🇳💃';
    genre = 'Bollywood Hits';
    energy = '90% Desi Hype';
    return {
      vibeTitle: `Bollywood Hindi Hits`,
      vibeDescription: `Pure 100% Hindi Bollywood chartbusters for your ${mood} mood.`,
      emoji,
      genre,
      energy,
      colorTheme,
      spotifySearchQuery: `Bollywood Hindi ${mood}`,
      spotifyPlaylistCategory: category,
      tracks: SONG_DATABASE.hindi.slice(0, 12),
    };
  }

  return {
    vibeTitle: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Playlist`,
    vibeDescription: `A hand-tailored sonic atmosphere tuned to your current mindset.`,
    emoji,
    genre,
    energy,
    colorTheme,
    spotifySearchQuery: `${mood}`,
    spotifyPlaylistCategory: category,
    tracks: SONG_DATABASE.english.slice(0, 12),
  };
}

module.exports = { analyzeMoodAndRecommend, getMoreTracks, fetchRealTrackAudio, getCandidateVideoIds };
