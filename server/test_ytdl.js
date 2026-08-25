const ytdl = require('@distube/ytdl-core');

async function testYtdl(videoId) {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    console.log('Testing Ytdl with:', url);
    const info = await ytdl.getInfo(url);
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    console.log('Found audio formats:', audioFormats.length);
    if (audioFormats.length > 0) {
      console.log('Top audio format URL:', audioFormats[0].url.slice(0, 80) + '...');
      console.log('Bitrate:', audioFormats[0].bitrate, 'Container:', audioFormats[0].container);
    }
  } catch (e) {
    console.error('Ytdl error:', e.message);
  }
}

(async () => {
  await testYtdl('Bea019pOw5w'); // Kar Gayi Chull
})();
