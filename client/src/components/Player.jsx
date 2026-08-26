// src/components/Player.jsx
import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  ExternalLink, 
  Music, 
  Radio, 
  Zap, 
  Share2, 
  Check, 
  Sparkles, 
  Disc3, 
  Plus, 
  Loader2, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Repeat,
  Heart,
  Mic2,
  RadioTower,
  CloudRain,
  Timer,
  Sliders,
  Camera,
  X,
  Waves,
  Flame,
  Coffee,
  RotateCw,
  TrendingUp,
  Flame as FireIcon
} from "lucide-react";

// Clean Spotify & YouTube SVG Icons
function SpotifyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.308c-.215.353-.674.464-1.027.249-2.812-1.718-6.353-2.107-10.523-1.155-.403.092-.803-.16-.895-.563-.092-.403.16-.803.563-.895 4.571-1.044 8.487-.601 11.633 1.337.353.215.464.674.249 1.027zm1.468-3.264c-.27.44-.847.579-1.287.31-3.218-1.977-8.125-2.55-11.933-1.393-.496.15-1.024-.134-1.174-.63-.15-.496.134-1.024.63-1.174 4.354-1.321 9.775-.681 13.454 1.58.44.27.579.847.31 1.287zm.127-3.397C15.244 8.354 8.903 8.14 5.234 9.254c-.59.18-1.218-.158-1.398-.748-.18-.59.158-1.218.748-1.398 4.225-1.283 11.233-1.036 15.688 1.608.53.315.705 1.004.39 1.534-.315.53-1.004.705-1.534.39z"/>
    </svg>
  );
}

function YouTubeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

// Web Audio API Ambient Sound Synthesizer
class AmbientSoundGenerator {
  constructor() {
    this.ctx = null;
    this.nodes = {};
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setSound(type, volume) {
    this.init();
    if (!this.nodes[type]) {
      if (volume <= 0) return;
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.value = 800;
      } else if (type === 'waves') {
        filter.type = 'bandpass';
        filter.frequency.value = 400;
        filter.Q.value = 1.0;
      } else if (type === 'fire') {
        filter.type = 'highpass';
        filter.frequency.value = 1200;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
      }

      const gainNode = this.ctx.createGain();
      gainNode.gain.value = volume * 0.15;

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.ctx.destination);
      whiteNoise.start(0);

      this.nodes[type] = { source: whiteNoise, gain: gainNode };
    } else {
      this.nodes[type].gain.gain.setValueAtTime(volume * 0.15, this.ctx.currentTime);
    }
  }

  stopAll() {
    Object.keys(this.nodes).forEach(key => {
      try {
        this.nodes[key].source.stop();
        this.nodes[key].source.disconnect();
      } catch (e) {}
    });
    this.nodes = {};
  }
}

const ambientSynth = new AmbientSoundGenerator();

export default function Player({ playlist, onRefreshPlaylist }) {
  const { 
    mood,
    vibeTitle, 
    vibeDescription, 
    emoji, 
    genre, 
    energy, 
    colorTheme = ["#6366f1", "#a855f7"], 
    spotifyUrl, 
    tracks: initialTracks = [] 
  } = playlist;

  const [tracks, setTracks] = useState(initialTracks);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210); // default to ~3.5 min full song
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Feature States
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem("aurabeat_liked_songs");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showLikedOnly, setShowLikedOnly] = useState(false);

  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  const [isAiDjActive, setIsAiDjActive] = useState(false);
  const [isDjSpeaking, setIsDjSpeaking] = useState(false);

  const [showAmbientModal, setShowAmbientModal] = useState(false);
  const [ambientVolumes, setAmbientVolumes] = useState({ rain: 0, waves: 0, fire: 0, coffee: 0 });

  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(0);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState(0);

  const [showStoryModal, setShowStoryModal] = useState(false);

  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const playerSectionRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const syncIntervalRef = useRef(null);

  // Load YouTube IFrame API for Full Length 3-5 Minute Songs
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initYtPlayer();
      };
    } else {
      initYtPlayer();
    }

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  const initYtPlayer = () => {
    if (window.YT && window.YT.Player && !ytPlayerRef.current) {
      try {
        ytPlayerRef.current = new window.YT.Player('full-song-audio-engine', {
          height: '1',
          width: '1',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onReady: (e) => {
              e.target.setVolume(volume * 100);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                const fullDuration = ytPlayerRef.current?.getDuration();
                if (fullDuration && fullDuration > 30) {
                  setDuration(fullDuration);
                }
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                handleNextTrack();
              }
            },
            onError: () => {
              // Fallback to HTML5 audio if YouTube restriction occurs
              if (audioRef.current && activeTrack?.previewUrl) {
                audioRef.current.src = activeTrack.previewUrl;
                audioRef.current.play().catch(() => {});
              }
            }
          }
        });
      } catch (e) {}
    }
  };

  // High-accuracy time sync for full 3-5 minute song playback
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const state = ytPlayerRef.current.getPlayerState();
          if (state === 1) { // PLAYING
            const time = ytPlayerRef.current.getCurrentTime();
            setCurrentTime(time);
            const fullDur = ytPlayerRef.current.getDuration();
            if (fullDur && fullDur > 10) setDuration(fullDur);
          }
        } catch (e) {}
      }
    }, 500);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    setTracks(initialTracks);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(210);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.stopVideo === 'function') {
      try { ytPlayerRef.current.stopVideo(); } catch (e) {}
    }
  }, [playlist, initialTracks]);

  const activeTrack = (showLikedOnly ? likedSongs[currentTrackIndex] : tracks[currentTrackIndex]) || tracks[0] || null;

  // Save liked songs to localStorage
  const toggleLike = (track) => {
    if (!track) return;
    setLikedSongs(prev => {
      const exists = prev.some(t => t.title.toLowerCase() === track.title.toLowerCase());
      let updated;
      if (exists) {
        updated = prev.filter(t => t.title.toLowerCase() !== track.title.toLowerCase());
      } else {
        updated = [...prev, track];
      }
      try {
        localStorage.setItem("aurabeat_liked_songs", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const isCurrentLiked = activeTrack ? likedSongs.some(t => t.title.toLowerCase() === activeTrack.title.toLowerCase()) : false;

  // AI Voice DJ Announcer
  const speakDjIntro = (track) => {
    if (!isAiDjActive || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const intros = [
      `Up next on Joyson Music, here's the full track of ${track.title} by ${track.artist}! Top blockbuster hit.`,
      `You're tuned into AuraBeat. Let's vibe with full-length ${track.title}!`,
      `Here comes the #1 most listened song for your mood, ${track.title} by ${track.artist}. Enjoy!`,
      `Spinning full track, ${track.title}. Let the music take over!`
    ];
    const text = intros[Math.floor(Math.random() * intros.length)];
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    setIsDjSpeaking(true);
    utterance.onend = () => setIsDjSpeaking(false);
    utterance.onerror = () => setIsDjSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Fetch Live Synchronized Karaoke Lyrics
  useEffect(() => {
    if (showLyrics && activeTrack) {
      setLoadingLyrics(true);
      fetch(`/api/lyrics?title=${encodeURIComponent(activeTrack.title)}&artist=${encodeURIComponent(activeTrack.artist)}`)
        .then(res => res.json())
        .then(data => {
          setLyrics(data.lyrics || []);
          setLoadingLyrics(false);
        })
        .catch(() => {
          setLoadingLyrics(false);
        });
    }
  }, [showLyrics, activeTrack?.title]);

  // Sleep Timer Countdown Interval
  useEffect(() => {
    if (sleepTimerMinutes > 0) {
      setSleepTimerSecondsLeft(sleepTimerMinutes * 60);
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);

      sleepTimerRef.current = setInterval(() => {
        setSleepTimerSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(sleepTimerRef.current);
            if (audioRef.current) audioRef.current.pause();
            if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
              try { ytPlayerRef.current.pauseVideo(); } catch (e) {}
            }
            setIsPlaying(false);
            setSleepTimerMinutes(0);
            ambientSynth.stopAll();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
      setSleepTimerSecondsLeft(0);
    }

    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [sleepTimerMinutes]);

  // Play Full Song Function
  const playTrackAtIndex = async (index) => {
    const list = showLikedOnly ? likedSongs : tracks;
    if (index < 0 || index >= list.length) return;
    const track = list[index];
    if (!track) return;

    setCurrentTrackIndex(index);
    setCurrentTime(0);

    if (isAiDjActive) {
      speakDjIntro(track);
    }

    // Resolve YouTube Video ID for full 3-5 minute song if needed
    let videoId = track.youtubeVideoId || (track.candidateVideoIds && track.candidateVideoIds[0]);

    if (!videoId) {
      try {
        const res = await fetch(`/api/candidate-videos?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.videoId) {
            videoId = data.videoId;
            setTracks(prev => {
              const copy = [...prev];
              if (copy[index]) {
                copy[index] = { ...copy[index], youtubeVideoId: data.videoId, candidateVideoIds: data.videoIds };
              }
              return copy;
            });
          }
        }
      } catch (e) {}
    }

    // Play full length audio via YouTube Audio engine
    if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(videoId);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      } catch (e) {
        // Fallback to HTML5 audio
        playHtml5Audio(track);
      }
    } else {
      playHtml5Audio(track);
    }

    if (playerSectionRef.current) {
      playerSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const playHtml5Audio = async (track) => {
    let audioUrl = track.previewUrl;
    if (!audioUrl) {
      try {
        const res = await fetch(`/api/track-audio?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
        if (res.ok) {
          const data = await res.json();
          audioUrl = data.previewUrl;
        }
      } catch (e) {}
    }

    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try { ytPlayerRef.current.pauseVideo(); } catch (e) {}
      }
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        try { 
          ytPlayerRef.current.playVideo(); 
          setIsPlaying(true);
        } catch (e) {
          playTrackAtIndex(currentTrackIndex);
        }
      } else {
        playTrackAtIndex(currentTrackIndex);
      }
    }
  };

  const handleNextTrack = () => {
    const list = showLikedOnly ? likedSongs : tracks;
    if (isRepeat) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        ytPlayerRef.current.seekTo(0);
        ytPlayerRef.current.playVideo();
      }
      return;
    }
    if (currentTrackIndex < list.length - 1) {
      playTrackAtIndex(currentTrackIndex + 1);
    } else {
      playTrackAtIndex(0);
    }
  };

  const handlePrevTrack = () => {
    if (currentTrackIndex > 0) {
      playTrackAtIndex(currentTrackIndex - 1);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(time, true); } catch (e) {}
    }
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      try { ytPlayerRef.current.setVolume(val * 100); } catch (e) {}
    }
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.unMute === 'function') {
        try { ytPlayerRef.current.unMute(); ytPlayerRef.current.setVolume(volume * 100); } catch (e) {}
      }
      if (audioRef.current) audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.mute === 'function') {
        try { ytPlayerRef.current.mute(); } catch (e) {}
      }
      if (audioRef.current) audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleAmbientChange = (type, val) => {
    setAmbientVolumes(prev => ({ ...prev, [type]: val }));
    ambientSynth.setSound(type, val);
  };

  const handleCopyLink = () => {
    const text = `Listen to "${vibeTitle}" AI Mood Playlist on AuraBeat! 🎵 ${spotifyUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Refresh All Songs
  const handleRefreshAll = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (onRefreshPlaylist) {
        await onRefreshPlaylist(mood || vibeTitle);
      } else {
        const res = await fetch("/api/playlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood: mood || vibeTitle }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.tracks && data.tracks.length > 0) {
            setTracks(data.tracks);
            setCurrentTrackIndex(0);
          }
        }
      }
    } catch (e) {
      console.warn("Refresh error:", e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);

    try {
      const existingTitles = tracks.map(t => t.title);
      const res = await fetch("/api/more-tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood || vibeTitle, existingTitles }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          setTracks(prev => [...prev, ...data.tracks]);
        }
      }
    } catch (err) {
      console.error("Failed to load more tracks:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const gradientStyle = {
    background: `linear-gradient(135deg, ${colorTheme[0]}25 0%, ${colorTheme[1]}30 100%)`,
    borderColor: `${colorTheme[0]}40`,
  };

  const displayedList = showLikedOnly ? likedSongs : tracks;

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Invisible Full Song Audio Engine (Zero Video UI, Pure Audio) */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          right: 0, 
          width: '1px', 
          height: '1px', 
          opacity: 0.001, 
          pointerEvents: 'none', 
          zIndex: -9999 
        }}
      >
        <div id="full-song-audio-engine" />
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        onEnded={handleNextTrack}
      />

      {/* Playlist Hero Banner */}
      <div 
        style={gradientStyle}
        className="relative overflow-hidden rounded-3xl p-4 sm:p-7 border shadow-xl bg-slate-900/90 transition-all duration-300"
      >
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl">{emoji}</span>
              <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Spotify Top Mix • Full Songs
              </span>
              {energy && (
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[11px] sm:text-xs font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  {energy}
                </span>
              )}
              {genre && (
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-[11px] sm:text-xs font-medium">
                  {genre}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              {vibeTitle}
            </h2>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {vibeDescription}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end">
            {/* Refresh All Songs Button */}
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold active:scale-95 disabled:opacity-50"
              title="Refresh all songs"
            >
              <RotateCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>{isRefreshing ? "Refreshing…" : "Refresh Mix"}</span>
            </button>

            {/* Share Mood Story Button */}
            <button
              onClick={() => setShowStoryModal(true)}
              className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium"
              title="Share Mood Story Card"
            >
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Story</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="p-2 sm:p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium"
              title="Share vibe"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Share"}</span>
            </button>

            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-xl shadow-lg shadow-[#1DB954]/20 transition-all flex items-center gap-1.5 text-xs sm:text-sm font-semibold hover:scale-105 active:scale-95 flex-1 md:flex-initial justify-center"
            >
              <SpotifyIcon className="w-4 h-4" />
              <span>Open in Spotify</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Feature Tool Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            {/* Liked Songs Filter Toggle */}
            <button
              onClick={() => setShowLikedOnly(!showLikedOnly)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all border ${
                showLikedOnly
                  ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showLikedOnly ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>Favorites ({likedSongs.length})</span>
            </button>

            {/* AI Radio DJ Toggle */}
            <button
              onClick={() => setIsAiDjActive(!isAiDjActive)}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all border ${
                isAiDjActive
                  ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
              title="AI Radio Host Voice"
            >
              <RadioTower className={`w-3.5 h-3.5 ${isAiDjActive ? "text-indigo-400 animate-pulse" : ""}`} />
              <span>AI DJ {isAiDjActive ? "ON" : "OFF"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Ambient Soundscape Button */}
            <button
              onClick={() => setShowAmbientModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 flex items-center gap-1.5 font-medium transition-all"
            >
              <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ambience</span>
            </button>

            {/* Sleep Timer Dropdown */}
            <div className="relative flex items-center gap-1 bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-700 text-slate-300">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <select
                value={sleepTimerMinutes}
                onChange={(e) => setSleepTimerMinutes(parseInt(e.target.value, 10))}
                className="bg-transparent text-xs text-white focus:outline-none cursor-pointer"
              >
                <option value="0" className="bg-slate-900">Timer: Off</option>
                <option value="15" className="bg-slate-900">15 min</option>
                <option value="30" className="bg-slate-900">30 min</option>
                <option value="45" className="bg-slate-900">45 min</option>
                <option value="60" className="bg-slate-900">60 min</option>
              </select>
              {sleepTimerSecondsLeft > 0 && (
                <span className="text-[10px] text-amber-400 font-mono font-bold ml-1">
                  ({Math.floor(sleepTimerSecondsLeft / 60)}m)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Beautiful Pure Audio Player */}
      {activeTrack && (
        <div 
          ref={playerSectionRef}
          className="relative bg-slate-900 border-2 border-emerald-500/50 rounded-3xl p-5 sm:p-7 shadow-2xl transition-all duration-300 overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <div 
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: colorTheme[0] || "#10b981" }}
          />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-8">
            {/* Vinyl Album Art */}
            <div className="relative group flex-shrink-0">
              <div className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-800 transition-transform duration-500 ${isPlaying ? "scale-105 shadow-emerald-500/25 ring-2 ring-emerald-500/50" : ""}`}>
                {activeTrack.artworkUrl ? (
                  <img 
                    src={activeTrack.artworkUrl} 
                    alt={activeTrack.title} 
                    className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? "scale-110 rotate-2" : ""}`} 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                    <Disc3 className={`w-16 h-16 text-emerald-400 ${isPlaying ? "animate-spin" : ""}`} />
                  </div>
                )}
              </div>

              {/* Pulsing play badge */}
              {isPlaying && (
                <span className="absolute -bottom-2 -right-2 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-slate-900" />
                </span>
              )}
            </div>

            {/* Song Details & Pure Audio Controls */}
            <div className="flex-1 w-full flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Now Playing • Full Song
                    </span>
                    {activeTrack.streamCount && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-[10px] font-bold flex items-center gap-1">
                        <FireIcon className="w-2.5 h-2.5 fill-amber-400" />
                        {activeTrack.streamCount}
                      </span>
                    )}
                    {activeTrack.duration && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        • {activeTrack.duration}
                      </span>
                    )}
                    {isDjSpeaking && (
                      <span className="text-[10px] text-indigo-400 flex items-center gap-1 font-bold animate-pulse">
                        <RadioTower className="w-3 h-3" /> AI DJ Speaking…
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-2xl font-extrabold text-white leading-tight">
                    {activeTrack.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 font-medium mt-1">
                    {activeTrack.artist}
                  </p>
                  {activeTrack.album && (
                    <p className="text-xs text-slate-500 mt-0.5 truncate max-w-md">
                      Album: {activeTrack.album}
                    </p>
                  )}
                </div>

                {/* Heart Favorite Button */}
                <button
                  onClick={() => toggleLike(activeTrack)}
                  className={`p-2.5 rounded-2xl border transition-all active:scale-90 ${
                    isCurrentLiked
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-500 shadow-md shadow-rose-500/20"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                  }`}
                  title={isCurrentLiked ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Heart className={`w-5 h-5 ${isCurrentLiked ? "fill-rose-500" : ""}`} />
                </button>
              </div>

              {/* Interactive Timeline Scrubber (Full 3-5 min timeline) */}
              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="text-emerald-400 font-bold">{formatTime(currentTime)}</span>
                  <span>{formatTime(duration || 210)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 210}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-all hover:h-2.5"
                />
              </div>

              {/* Playback Button Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3">
                  {/* Prev Button */}
                  <button
                    onClick={handlePrevTrack}
                    disabled={currentTrackIndex === 0}
                    className="p-2.5 sm:p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 rounded-2xl transition-all active:scale-95 border border-slate-700"
                    title="Previous Song"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>

                  {/* Big Play / Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="p-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center font-bold"
                    title={isPlaying ? "Pause Song" : "Play Full Song"}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-current" />
                    ) : (
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    )}
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={handleNextTrack}
                    className="p-2.5 sm:p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition-all active:scale-95 border border-slate-700"
                    title="Next Song"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>

                  {/* Repeat Toggle */}
                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`p-2.5 rounded-xl transition-all border ${
                      isRepeat 
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400" 
                        : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                    }`}
                    title={isRepeat ? "Repeat On" : "Repeat Off"}
                  >
                    <Repeat className="w-4 h-4" />
                  </button>
                </div>

                {/* Lyrics & Volume Controls */}
                <div className="flex items-center gap-3">
                  {/* Lyrics Toggle Button */}
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                      showLyrics
                        ? "bg-emerald-500 text-slate-950 shadow"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    <Mic2 className="w-3.5 h-3.5" />
                    <span>Lyrics</span>
                  </button>

                  {/* Volume Slider */}
                  <div className="flex items-center gap-2 text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-xl border border-slate-800">
                    <button onClick={toggleMute} className="hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-16 sm:w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* External Links */}
              <div className="pt-2 flex items-center justify-end gap-2 text-xs">
                <a
                  href={activeTrack.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#1DB954]/20 hover:bg-[#1DB954]/30 text-[#1DB954] border border-[#1DB954]/30 rounded-xl flex items-center gap-1.5 font-bold transition-all"
                >
                  <SpotifyIcon className="w-3.5 h-3.5" />
                  <span>Open on Spotify</span>
                </a>

                <a
                  href={activeTrack.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-xl flex items-center gap-1.5 font-bold transition-all"
                >
                  <YouTubeIcon className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Synchronized Karaoke Lyrics Drawer */}
      {showLyrics && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-5 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-emerald-400" />
              <span>Karaoke Lyrics — {activeTrack?.title}</span>
            </h4>
            <button onClick={() => setShowLyrics(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {loadingLyrics ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span>Generating real-time karaoke lyrics…</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
              {lyrics.map((line, idx) => {
                const isActive = currentTime >= line.time && (idx === lyrics.length - 1 || currentTime < lyrics[idx + 1].time);
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 font-extrabold text-sm sm:text-base border border-emerald-500/40 shadow-sm scale-105"
                        : "text-slate-400 text-xs sm:text-sm hover:text-white"
                    }`}
                  >
                    {line.text}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ambient Soundscapes Mixer Modal */}
      {showAmbientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-cyan-400" />
                <span>Ambient Sound Mixer</span>
              </h3>
              <button onClick={() => setShowAmbientModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">Mix relaxing background soundscapes underneath your music:</p>

            <div className="space-y-3.5">
              {/* Rain */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 w-24">
                  <CloudRain className="w-4 h-4" />
                  <span>Rain</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolumes.rain}
                  onChange={(e) => handleAmbientChange('rain', parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Waves */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400 w-24">
                  <Waves className="w-4 h-4" />
                  <span>Ocean</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolumes.waves}
                  onChange={(e) => handleAmbientChange('waves', parseFloat(e.target.value))}
                  className="flex-1 accent-blue-400 cursor-pointer"
                />
              </div>

              {/* Campfire */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 w-24">
                  <Flame className="w-4 h-4" />
                  <span>Campfire</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolumes.fire}
                  onChange={(e) => handleAmbientChange('fire', parseFloat(e.target.value))}
                  className="flex-1 accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Coffee */}
              <div className="flex items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 w-24">
                  <Coffee className="w-4 h-4" />
                  <span>Cafe</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolumes.coffee}
                  onChange={(e) => handleAmbientChange('coffee', parseFloat(e.target.value))}
                  className="flex-1 accent-orange-400 cursor-pointer"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setAmbientVolumes({ rain: 0, waves: 0, fire: 0, coffee: 0 });
                ambientSynth.stopAll();
              }}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
            >
              Turn Off All Ambience
            </button>
          </div>
        </div>
      )}

      {/* Share Mood Story Card Modal */}
      {showStoryModal && activeTrack && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Share Mood Story</span>
              <button onClick={() => setShowStoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* The Story Card Graphic */}
            <div 
              style={gradientStyle}
              className="p-6 rounded-3xl border border-emerald-500/40 shadow-2xl space-y-4 text-center bg-slate-950/80"
            >
              <div className="text-3xl">{emoji}</div>
              <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700">
                {activeTrack.artworkUrl ? (
                  <img src={activeTrack.artworkUrl} alt={activeTrack.title} className="w-full h-full object-cover" />
                ) : (
                  <Disc3 className="w-full h-full p-6 text-emerald-400" />
                )}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white truncate">{activeTrack.title}</h3>
                <p className="text-xs text-slate-300 truncate mt-0.5">{activeTrack.artist}</p>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-emerald-300 font-mono font-bold">
                🎧 Listening on AuraBeat
              </div>
            </div>

            <button
              onClick={() => {
                const shareText = `Listening to "${activeTrack.title}" on AuraBeat! 🎵 ${spotifyUrl}`;
                navigator.clipboard.writeText(shareText);
                alert("Story caption copied to clipboard! Share on WhatsApp / Instagram.");
                setShowStoryModal(false);
              }}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-2xl shadow-lg transition-all"
            >
              Copy Share Story Link
            </button>
          </div>
        </div>
      )}

      {/* Recommended / Liked Track List */}
      <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-3.5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between mb-3 pb-2.5 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {showLikedOnly ? "Liked Songs" : "Top Most Listened Tracks (Full Length)"} ({displayedList.length})
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] text-amber-400/90 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <TrendingUp className="w-3 h-3" /> Ranked by Popularity
            </span>
          </div>
        </div>

        {displayedList.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {showLikedOnly ? "No liked songs yet! Click the ❤️ heart button on any song to save it." : "No songs found."}
          </div>
        ) : (
          <div className="space-y-2">
            {displayedList.map((track, idx) => {
              const isThisSelected = currentTrackIndex === idx;
              const isLiked = likedSongs.some(t => t.title.toLowerCase() === track.title.toLowerCase());
              const isTopOne = idx === 0 && !showLikedOnly;
              const isTopThree = idx < 3 && !showLikedOnly;

              return (
                <div
                  key={idx}
                  onClick={() => playTrackAtIndex(idx)}
                  className={`group relative flex items-center justify-between gap-2.5 p-2.5 sm:p-3.5 rounded-2xl transition-all duration-150 border cursor-pointer ${
                    isThisSelected
                      ? "bg-slate-800/95 border-emerald-500/70 shadow-md shadow-emerald-500/10"
                      : isTopOne
                        ? "bg-gradient-to-r from-amber-500/10 to-slate-950 border-amber-500/30 hover:border-amber-500/60"
                        : "bg-slate-950/50 hover:bg-slate-800/60 border-slate-800/70 hover:border-slate-700"
                  }`}
                >
                  {/* Album Art & Song Details */}
                  <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0">
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow">
                      {track.artworkUrl ? (
                        <img 
                          src={track.artworkUrl} 
                          alt={track.title} 
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Music className="w-5 h-5 text-slate-500" />
                      )}

                      {/* Play Button Overlay */}
                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-all ${
                          isThisSelected && isPlaying
                            ? "bg-emerald-500 text-slate-950" 
                            : "bg-slate-950/60 text-white opacity-0 group-hover:opacity-100"
                        }`}
                      >
                        {isThisSelected && isPlaying ? (
                          <Pause className="w-4 h-4 fill-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Song Title, Ranking & Stream Count */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5">
                        {isTopOne && (
                          <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black rounded text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                            <FireIcon className="w-2.5 h-2.5 fill-current" /> #1 Hit
                          </span>
                        )}
                        {isTopThree && !isTopOne && (
                          <span className="px-1.5 py-0.2 bg-slate-800 text-amber-300 font-bold border border-amber-500/30 rounded text-[9px]">
                            Top {idx + 1}
                          </span>
                        )}
                        <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${isThisSelected ? "text-emerald-400 font-extrabold" : "text-white"}`}>
                          {track.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5">
                        <span className="font-medium text-slate-300 truncate">{track.artist}</span>
                        {track.streamCount && (
                          <span className="font-mono text-amber-400/90 text-[10px] flex-shrink-0 font-semibold">
                            • {track.streamCount}
                          </span>
                        )}
                        {track.duration && (
                          <span className="font-mono text-slate-500 text-[10px] flex-shrink-0">
                            • {track.duration}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {/* Favorite Heart Button */}
                    <button
                      onClick={() => toggleLike(track)}
                      className={`p-1.5 rounded-xl transition-all ${
                        isLiked ? "text-rose-500" : "text-slate-500 hover:text-slate-300"
                      }`}
                      title={isLiked ? "Unlike" : "Like"}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
                    </button>

                    <button
                      onClick={() => {
                        if (isThisSelected) {
                          togglePlay();
                        } else {
                          playTrackAtIndex(idx);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isThisSelected && isPlaying
                          ? "bg-emerald-500 text-slate-950 shadow"
                          : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                      }`}
                      title="Play Full Song"
                    >
                      {isThisSelected && isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      <span>{isThisSelected && isPlaying ? "Playing" : "Play"}</span>
                    </button>

                    <a
                      href={track.spotifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on Spotify"
                      className="p-1.5 sm:p-2 text-slate-400 hover:text-[#1DB954] hover:bg-slate-800 rounded-xl transition-all"
                    >
                      <SpotifyIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Songs Button */}
        {!showLikedOnly && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-slate-800 to-slate-800/90 hover:from-slate-700 hover:to-slate-700/90 border border-slate-700 hover:border-emerald-500/60 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>Fetching More Top Songs…</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Load More Songs for this Mood</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
