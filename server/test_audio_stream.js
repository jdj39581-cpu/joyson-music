const play = require('play-dl');

async function testAudioStream(videoId) {
  try {
    console.log('Testing videoId:', videoId);
    const stream = await play.stream(`https://www.youtube.com/watch?v=${videoId}`, {
      quality: 1, // lowest/fastest or audio only
      discordPlayerCompatibility: true
    });
    console.log('Stream URL generated:', !!stream.url, stream.type);
  } catch (e) {
    console.error('play-dl error:', e.message);
  }
}

(async () => {
  await testAudioStream('Bea019pOw5w'); // Kar Gayi Chull
})();
