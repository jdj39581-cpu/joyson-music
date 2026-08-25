const axios = require('axios');

async function getExactVideoIds(title, artist = '') {
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
    // Extract videoId from videoRenderer objects only
    const regex = /"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/g;
    const ids = [];
    let match;
    while ((match = regex.exec(html)) !== null) {
      const id = match[1];
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }

    if (ids.length === 0) {
      const fallbackRegex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
      while ((match = fallbackRegex.exec(html)) !== null) {
        const id = match[1];
        if (!ids.includes(id)) {
          ids.push(id);
        }
      }
    }

    return ids.slice(0, 4);
  } catch (err) {
    console.error('Error fetching for', title, err.message);
    return [];
  }
}

(async () => {
  const songs = [
    { title: 'London Thumakda', artist: 'Labh Janjua' },
    { title: 'Kar Gayi Chull', artist: 'Badshah' },
    { title: 'Gallan Goodiyaan', artist: 'Shankar Mahadevan' },
    { title: 'Nashe Si Chadh Gayi', artist: 'Arijit Singh' },
    { title: 'Badtameez Dil', artist: 'Benny Dayal' },
    { title: 'Singara Siriye', artist: 'Vijay Prakash' },
    { title: 'Belakina Kavidhe', artist: 'Sanjith Hegde' }
  ];

  for (const s of songs) {
    const ids = await getExactVideoIds(s.title, s.artist);
    console.log(s.title, '=> Exact Video IDs:', ids);
  }
})();
