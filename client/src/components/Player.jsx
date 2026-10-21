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
  Flame as FireIcon, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Gauge, 
  Search, 
  Loader2,
  ListMusic,
  Plus,
  Trash2,
  Activity,
  Layers,
  Shuffle,
  ChevronUp,
  ChevronDown,
  Smartphone,
  MoreHorizontal,
  FolderPlus
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

// Fisher-Yates array shuffle for instant zero-lag mix randomization
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
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

const SPEED_OPTIONS = [
  { label: "0.85x", val: 0.85, name: "Slowed & Reverb 🌙" },
  { label: "1.0x", val: 1.0, name: "Original Normal 🎵" },
  { label: "1.25x", val: 1.25, name: "Workout Hype 🔥" },
  { label: "1.5x", val: 1.5, name: "Speed Up ⚡" },
];

const SOUND_MODES = [
  { id: "studio", name: "Studio HD", icon: "🎧" },
  { id: "bass", name: "Bass Boost", icon: "🔊" },
  { id: "spatial", name: "8D Spatial", icon: "🌌" },
  { id: "vocal", name: "Vocal Clarity", icon: "🎙️" }
];

const CATEGORIES = [
  { id: "all", label: "✨ All Songs" },
  { id: "mass", label: "🔥 Mass & Dance" },
  { id: "romantic", label: "❤️ Romantic Melodies" },
  { id: "chill", label: "🎧 Chill & Lo-Fi" },
  { id: "classics", label: "⭐ All-Time Hits" }
];

const EQ_PRESETS = [
  { id: "flat", name: "Flat / Studio 🎧", gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: "bass", name: "Extreme Bass Boost 🔊", gains: [9, 8, 7, 4, 1, 0, 0, 1, 3, 4] },
  { id: "vocal", name: "Vocal Clarity 🎙️", gains: [-2, -1, 0, 3, 6, 7, 5, 3, 1, -1] },
  { id: "edm", name: "Club EDM ⚡", gains: [7, 6, 3, 0, 1, 4, 6, 7, 8, 7] },
  { id: "lofi", name: "Lo-Fi Warmth 🌙", gains: [5, 5, 4, 2, 1, 0, -2, -4, -6, -8] },
  { id: "pop", name: "Pop Sparkle ✨", gains: [2, 3, 3, 1, 0, 2, 4, 6, 7, 8] },
  { id: "rock", name: "Rock Power 🎸", gains: [6, 5, 4, 1, -1, 0, 3, 5, 7, 8] },
  { id: "acoustic", name: "Acoustic / Folk 🌾", gains: [3, 3, 2, 2, 3, 4, 4, 4, 3, 2] }
];

const EQ_FREQUENCIES = ["32Hz", "64Hz", "125Hz", "250Hz", "500Hz", "1kHz", "2kHz", "4kHz", "8kHz", "16kHz"];

function EqualizerModal({ isOpen, onClose, eqGains, onGainChange, onSelectPreset, currentPreset }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#181818] border border-[#282828] rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#1ed760]" />
            <h3 className="text-base font-extrabold text-white">Pro 10-Band Graphic Equalizer</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#b3b3b3] hover:text-white bg-[#282828] rounded-xl transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Chips */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#b3b3b3]">Audio Presets:</div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {EQ_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  currentPreset === preset.id
                    ? "bg-[#1ed760] text-black border-[#1ed760] shadow-md shadow-[#1ed760]/20"
                    : "bg-[#121212] text-[#b3b3b3] border-[#282828] hover:text-white hover:border-[#3e3e3e]"
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 10-Band Graphic Equalizer Vertical Sliders */}
        <div className="bg-[#121212] p-4 rounded-2xl border border-[#282828]">
          <div className="grid grid-cols-10 gap-1 sm:gap-2 items-end h-44 sm:h-48 pt-2 pb-1">
            {EQ_FREQUENCIES.map((freq, idx) => {
              const gain = eqGains[idx] || 0;
              return (
                <div key={idx} className="flex flex-col items-center justify-between h-full gap-1.5">
                  <span className={`text-[10px] font-mono font-bold ${gain > 0 ? "text-[#1ed760]" : gain < 0 ? "text-rose-400" : "text-[#b3b3b3]"}`}>
                    {gain > 0 ? `+${gain}` : gain}
                  </span>
                  
                  {/* Interactive Slider Track */}
                  <div className="relative flex-1 flex flex-col justify-center items-center w-full my-1">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={gain}
                      onChange={(e) => onGainChange(idx, parseInt(e.target.value, 10))}
                      className="accent-[#1ed760] cursor-pointer w-20 sm:w-24 -rotate-90 origin-center bg-[#282828] rounded-lg appearance-none h-2"
                    />
                  </div>
                  
                  <span className="text-[8px] sm:text-[10px] font-mono text-[#b3b3b3] tracking-tighter truncate text-center w-full">
                    {freq}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[11px] text-[#1ed760] font-mono font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#1ed760]" />
            ±12 dB Master Sound Control
          </span>
          <button
            onClick={() => onSelectPreset(EQ_PRESETS[0])}
            className="px-3.5 py-1.5 bg-[#282828] hover:bg-[#333333] text-[#b3b3b3] hover:text-white rounded-xl font-bold transition-all border border-[#3e3e3e]"
          >
            Reset to Flat
          </button>
        </div>
      </div>
    </div>
  );
}

function BeatsVisualizerModal({ isOpen, onClose, isPlaying, track, colorTheme }) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const numBars = 44;
    const bars = Array.from({ length: numBars }, (_, i) => ({
      height: Math.random() * 60 + 20,
      targetHeight: Math.random() * 60 + 20,
      speed: 0.08 + Math.random() * 0.08,
      hue: (i / numBars) * 120 + 140,
    }));

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: -(Math.random() * 1.5 + 0.5),
      speedX: (Math.random() - 0.5) * 1,
      alpha: Math.random() * 0.7 + 0.3
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.25)';
      ctx.fillRect(0, 0, width, height);

      // Draw floating beat particles
      particles.forEach(p => {
        p.y += isPlaying ? p.speedY * 1.8 : p.speedY * 0.5;
        p.x += p.speedX;
        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30, 215, 96, ${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#1ed760';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw 3D-styled Mirror Spectrum Bars
      const barWidth = (width / numBars) * 0.75;
      const gap = (width / numBars) * 0.25;
      const centerY = height / 2;

      bars.forEach((bar, i) => {
        if (isPlaying) {
          if (Math.abs(bar.height - bar.targetHeight) < 4) {
            bar.targetHeight = Math.random() * (height * 0.42) + 15;
          }
          bar.height += (bar.targetHeight - bar.height) * bar.speed;
        } else {
          bar.height += (10 - bar.height) * 0.1;
        }

        const x = i * (barWidth + gap) + gap / 2;
        const currentH = bar.height;

        // Top bar
        const gradient = ctx.createLinearGradient(0, centerY, 0, centerY - currentH);
        gradient.addColorStop(0, '#1ed760');
        gradient.addColorStop(0.6, '#06b6d4');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = isPlaying ? 15 : 0;
        ctx.shadowColor = '#1ed760';
        
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, centerY - currentH, barWidth, currentH, [4, 4, 0, 0]);
        } else {
          ctx.rect(x, centerY - currentH, barWidth, currentH);
        }
        ctx.fill();

        // Bottom mirrored bar
        const mirrorGrad = ctx.createLinearGradient(0, centerY, 0, centerY + currentH * 0.6);
        mirrorGrad.addColorStop(0, 'rgba(30, 215, 96, 0.4)');
        mirrorGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');
        ctx.fillStyle = mirrorGrad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, centerY, barWidth, currentH * 0.6, [0, 0, 4, 4]);
        } else {
          ctx.rect(x, centerY, barWidth, currentH * 0.6);
        }
        ctx.fill();

        ctx.shadowBlur = 0;
      });

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="w-full flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#1ed760] animate-pulse" />
          <span className="text-sm font-extrabold uppercase tracking-widest text-[#1ed760]">
            Spotify 3D Beats Spectrum Visualizer
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 bg-[#282828] hover:bg-[#3e3e3e] text-white rounded-2xl border border-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <X className="w-4 h-4" />
          <span>Close</span>
        </button>
      </div>

      <div className="relative w-full max-w-4xl h-80 sm:h-96 my-auto rounded-3xl overflow-hidden border border-[#1ed760]/30 bg-black shadow-2xl flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />
        
        <div className="absolute top-4 left-4 flex items-center gap-3 bg-[#181818]/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 pointer-events-none">
          {track?.artworkUrl && (
            <img src={track.artworkUrl} alt={track.title} className="w-10 h-10 rounded-xl object-cover" />
          )}
          <div>
            <div className="text-xs font-extrabold text-white truncate max-w-xs">{track?.title}</div>
            <div className="text-[11px] text-[#1ed760] truncate max-w-xs">{track?.artist}</div>
          </div>
        </div>

        {!isPlaying && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center pointer-events-none">
            <span className="px-4 py-2 bg-[#181818]/90 text-[#1ed760] border border-[#1ed760]/40 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">
              Press Play to Activate Visualizer Frequency
            </span>
          </div>
        )}
      </div>

      <div className="text-xs text-[#b3b3b3] font-mono text-center">
        ⚡ AuraBeat Neon Real-time Harmonic FFT Analysis • 60 FPS
      </div>
    </div>
  );
}

export default function Player({ 
  playlist, 
  onRefreshPlaylist, 
  userPlaylists = [], 
  onSelectLanguage, 
  onAddTrackToPlaylist, 
  onCreatePlaylist 
}) {
  const { 
    mood,
    vibeTitle = "Spotify Mix", 
    vibeDescription = "Top curated tracks for you", 
    emoji = "🎵", 
    genre, 
    energy, 
    colorTheme = ["#1ed760", "#121212"], 
    spotifyUrl, 
    tracks: initialTracks = [] 
  } = playlist || {};

  const [tracks, setTracks] = useState(initialTracks);
  const [currentTrack, setCurrentTrack] = useState(initialTracks[0] || null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(210);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const [autoLoadingMore, setAutoLoadingMore] = useState(false);

  // Audio Mode & Speed
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [soundModeIndex, setSoundModeIndex] = useState(0);
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  // Liked Songs
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem("aurabeat_liked_songs");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showLikedOnly, setShowLikedOnly] = useState(false);

  // Lyrics
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);

  // AI DJ
  const [isAiDjActive, setIsAiDjActive] = useState(false);
  const [isDjSpeaking, setIsDjSpeaking] = useState(false);

  // Ambience
  const [showAmbientModal, setShowAmbientModal] = useState(false);
  const [ambientVolumes, setAmbientVolumes] = useState({ rain: 0, waves: 0, fire: 0, coffee: 0 });

  // Sleep Timer
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState(0);
  const [sleepTimerSecondsLeft, setSleepTimerSecondsLeft] = useState(0);

  // Story Card
  const [showStoryModal, setShowStoryModal] = useState(false);

  // Filter Categories, Queue & 3D Visualizer
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [queue, setQueue] = useState([]);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Equalizer & Gapless Crossfade
  const [showEqModal, setShowEqModal] = useState(false);
  const [eqGains, setEqGains] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [selectedEqPreset, setSelectedEqPreset] = useState("flat");
  const [crossfadeDuration, setCrossfadeDuration] = useState(0);

  // "Add to Playlist" Dialog State
  const [trackForPlaylistModal, setTrackForPlaylistModal] = useState(null);

  // Mobile Fullscreen Now-Playing Drawer State
  const [showMobileNowPlaying, setShowMobileNowPlaying] = useState(false);

  // Mobile Screen Wake Lock API State ("Keep Phone Playing / Screen Awake")
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockSentinelRef = useRef(null);

  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const sleepTimerRef = useRef(null);
  const syncIntervalRef = useRef(null);
  const isDraggingScrubberRef = useRef(false);
  const lyricsContainerRef = useRef(null);
  const activeLyricRef = useRef(null);

  // Screen Wake Lock API Request / Release
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockSentinelRef.current = await navigator.wakeLock.request('screen');
        setWakeLockActive(true);
        wakeLockSentinelRef.current.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      } catch (err) {
        setWakeLockActive(false);
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
        wakeLockSentinelRef.current = null;
      } catch (e) {}
      setWakeLockActive(false);
    }
  };

  const toggleWakeLock = async () => {
    if (wakeLockActive) {
      await releaseWakeLock();
      showToast("Phone Screen Sleep: Default System Settings");
    } else {
      await requestWakeLock();
      showToast("📱 Phone Screen Awake: ON! Keeps music playing continuously");
    }
  };

  // Re-acquire WakeLock on visibility change if music is active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isPlaying && wakeLockActive) {
        await requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [isPlaying, wakeLockActive]);

  // Load YouTube IFrame API for Full Length Songs
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
                if (fullDuration && fullDuration > 15) {
                  setDuration(fullDuration);
                }
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              } else if (event.data === window.YT.PlayerState.ENDED) {
                handleNextTrack();
              }
            },
            onError: () => {
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

  // High-accuracy time sync (100ms) for smooth progress & lyrics tracking
  useEffect(() => {
    syncIntervalRef.current = setInterval(() => {
      if (isDraggingScrubberRef.current) return;

      // 1. Check YouTube Player
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
        try {
          const state = ytPlayerRef.current.getPlayerState();
          if (state === 1) { // PLAYING
            const time = ytPlayerRef.current.getCurrentTime();
            if (typeof time === 'number' && !isNaN(time)) {
              setCurrentTime(time);
            }
            const fullDur = ytPlayerRef.current.getDuration();
            if (fullDur && fullDur > 10) setDuration(fullDur);
          }
        } catch (e) {}
      }

      // 2. Check HTML5 Audio Player
      if (audioRef.current && !audioRef.current.paused) {
        if (typeof audioRef.current.currentTime === 'number' && !isNaN(audioRef.current.currentTime)) {
          setCurrentTime(audioRef.current.currentTime);
        }
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }
      }
    }, 100);

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  // Global Keyboard Shortcuts (Space, J, L, N, P, M, F)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'j' || e.key === 'J' || e.code === 'ArrowLeft') {
        handleSkipSeconds(-10);
      } else if (e.key === 'l' || e.key === 'L' || e.code === 'ArrowRight') {
        handleSkipSeconds(10);
      } else if (e.key === 'n' || e.key === 'N') {
        handleNextTrack();
      } else if (e.key === 'p' || e.key === 'P') {
        handlePrevTrack();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        setIsCinemaMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTime, currentTrackIndex, isMuted]);

  useEffect(() => {
    // Strictly deduplicate incoming tracks to ensure zero duplicates
    const seen = new Set();
    const unique = (initialTracks || []).filter(t => {
      if (!t || !t.title) return false;
      const k = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    setTracks(unique);
    setCurrentTrack(unique[0] || null);
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

  // Direct, rock-solid track reference
  const baseList = showLikedOnly ? likedSongs : tracks;
  const filteredByCategory = baseList.filter(track => {
    if (selectedCategory === "all") return true;
    const cat = (track.category || "").toLowerCase();
    const title = (track.title || "").toLowerCase();
    if (selectedCategory === "mass") {
      return cat === "mass" || cat === "workout" || cat === "dance" || title.includes("mass") || title.includes("dance") || title.includes("beat") || title.includes("dj");
    }
    if (selectedCategory === "romantic") {
      return cat === "romantic" || cat === "love" || title.includes("love") || title.includes("prema") || title.includes("pyar") || title.includes("ishq") || title.includes("dil");
    }
    if (selectedCategory === "chill") {
      return cat === "chill" || cat === "lofi" || cat === "acoustic" || title.includes("chill") || title.includes("unplugged") || title.includes("acoustic");
    }
    if (selectedCategory === "classics") {
      return cat === "classics" || cat === "retro" || (track.streamCount && (track.streamCount.includes("M") || track.streamCount.includes("B")));
    }
    return true;
  });

  const displayedList = filterQuery.trim()
    ? filteredByCategory.filter(t => 
        (t.title || "").toLowerCase().includes(filterQuery.toLowerCase()) || 
        (t.artist || "").toLowerCase().includes(filterQuery.toLowerCase())
      )
    : filteredByCategory;

  const activeTrack = currentTrack || displayedList[0] || tracks[0] || null;

  // MediaSession Lock-Screen Controls & Background Audio Registration
  useEffect(() => {
    if ('mediaSession' in navigator && activeTrack) {
      try {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: activeTrack.title,
          artist: activeTrack.artist,
          album: vibeTitle || "AuraBeat Spotify",
          artwork: [
            { src: activeTrack.artworkUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=512", sizes: "512x512", type: "image/jpeg" },
            { src: activeTrack.artworkUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=256", sizes: "256x256", type: "image/jpeg" },
            { src: activeTrack.artworkUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=128", sizes: "128x128", type: "image/jpeg" },
          ]
        });

        navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

        navigator.mediaSession.setActionHandler("play", () => togglePlay());
        navigator.mediaSession.setActionHandler("pause", () => togglePlay());
        navigator.mediaSession.setActionHandler("previoustrack", () => handlePrevTrack());
        navigator.mediaSession.setActionHandler("nexttrack", () => handleNextTrack());
        navigator.mediaSession.setActionHandler("seekto", (details) => {
          if (details.seekTime != null) handleSeekToTime(details.seekTime);
        });
        navigator.mediaSession.setActionHandler("seekforward", () => handleSkipSeconds(10));
        navigator.mediaSession.setActionHandler("seekbackward", () => handleSkipSeconds(-10));
      } catch (e) {}
    }
  }, [activeTrack?.title, activeTrack?.artist, isPlaying, vibeTitle]);

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
      `Up next on Joyson Music Spotify, here's ${track.title} by ${track.artist}! Enjoy the vibe.`,
      `You're tuned into AuraBeat. Let's vibe with ${track.title}!`,
      `Here comes the #1 hit for your mood, ${track.title} by ${track.artist}. Enjoy!`,
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

  // Active lyric line calculation
  const activeLyricIndex = (() => {
    if (!lyrics || lyrics.length === 0) return -1;
    let active = 0;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        active = i;
      } else {
        break;
      }
    }
    return active;
  })();

  // Smooth Auto-Scroll in lyrics drawer
  useEffect(() => {
    if (showLyrics && activeLyricIndex !== -1 && activeLyricRef.current && lyricsContainerRef.current) {
      const container = lyricsContainerRef.current;
      const activeEl = activeLyricRef.current;
      const targetScroll = activeEl.offsetTop - container.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);
      container.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
    }
  }, [activeLyricIndex, showLyrics]);

  const handleSeekToTime = (time) => {
    setCurrentTime(time);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(time, true); } catch (e) {}
    }
    if (audioRef.current) {
      try { audioRef.current.currentTime = time; } catch (e) {}
    }
  };

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
  const playTrack = async (track) => {
    if (!track) return;

    setCurrentTrack(track);
    setCurrentTime(0);

    if (isAiDjActive) {
      speakDjIntro(track);
    }

    let videoId = track.youtubeVideoId || (track.candidateVideoIds && track.candidateVideoIds[0]);

    if (!videoId) {
      try {
        const res = await fetch(`/api/candidate-videos?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.videoId) {
            videoId = data.videoId;
            setTracks(prev => prev.map(t => (t.title.toLowerCase() === track.title.toLowerCase()) ? { ...t, youtubeVideoId: data.videoId, candidateVideoIds: data.videoIds } : t));
            setCurrentTrack(prev => (prev && prev.title.toLowerCase() === track.title.toLowerCase()) ? { ...prev, youtubeVideoId: data.videoId, candidateVideoIds: data.videoIds } : prev);
          }
        }
      } catch (e) {}
    }

    // Keep mobile audio context awake
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }

    if (videoId && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(videoId);
        ytPlayerRef.current.playVideo();
        if (playbackSpeed !== 1.0 && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
          ytPlayerRef.current.setPlaybackRate(playbackSpeed);
        }
        setIsPlaying(true);
      } catch (e) {
        playHtml5Audio(track);
      }
    } else {
      playHtml5Audio(track);
    }

    // Auto-request screen wake lock on play
    if (!wakeLockSentinelRef.current && 'wakeLock' in navigator) {
      requestWakeLock();
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
      audioRef.current.playbackRate = playbackSpeed;
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
          playTrack(activeTrack);
        }
      } else {
        playTrack(activeTrack);
      }
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3200);
  };

  const handleGainChange = (bandIndex, val) => {
    setEqGains(prev => {
      const next = [...prev];
      next[bandIndex] = val;
      return next;
    });
    setSelectedEqPreset("custom");
  };

  const handleSelectPreset = (preset) => {
    setSelectedEqPreset(preset.id);
    setEqGains([...preset.gains]);
    showToast(`🎚️ Equalizer: ${preset.name}`);
  };

  const handleCycleCrossfade = () => {
    const nextVal = crossfadeDuration === 0 ? 3 : crossfadeDuration === 3 ? 6 : 0;
    setCrossfadeDuration(nextVal);
    showToast(nextVal === 0 ? "Smart DJ Crossfade: OFF" : `🔀 Smart DJ Crossfade: ${nextVal}s smooth mix active!`);
  };

  const addToQueue = (track, e) => {
    if (e) e.stopPropagation();
    setQueue(prev => [...prev, track]);
    showToast(`Added "${track.title}" to Up Next queue! 🎶`);
  };

  const removeFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
    showToast("Queue cleared!");
  };

  const playQueueTrack = (index) => {
    const trackToPlay = queue[index];
    if (!trackToPlay) return;
    setQueue(prev => prev.filter((_, i) => i !== index));
    playTrack(trackToPlay);
  };

  const handleShuffle = () => {
    setTracks(prev => {
      let shuffled = shuffleArray(prev);
      if (shuffled.length > 1 && prev.length > 0 && (shuffled[0].title || '').toLowerCase() === (prev[0].title || '').toLowerCase()) {
        const swapIdx = 1 + Math.floor(Math.random() * (shuffled.length - 1));
        [shuffled[0], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[0]];
      }
      if (shuffled.length > 0) {
        setCurrentTrack(shuffled[0]);
        if (isPlaying) {
          playTrack(shuffled[0]);
        }
      }
      showToast(`🔀 Shuffled! Now Playing: ${shuffled[0]?.title || 'New Song'}`);
      return shuffled;
    });
  };

  const loadMoreSongs = async () => {
    if (autoLoadingMore) return;
    setAutoLoadingMore(true);
    try {
      const existingTitles = tracks.map(t => t.title);
      const res = await fetch("/api/more-tracks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: mood || vibeTitle, existingTitles })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tracks && data.tracks.length > 0) {
          setTracks(prev => {
            const existingKeys = new Set(prev.map(t => (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')));
            const genuinelyNew = data.tracks.filter(t => {
              const k = (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              if (!k || existingKeys.has(k)) return false;
              existingKeys.add(k);
              return true;
            });
            if (genuinelyNew.length > 0) {
              return [...prev, ...genuinelyNew];
            }
            return prev;
          });
        }
      }
    } catch (e) {
      console.warn("Failed to load more tracks:", e);
    } finally {
      setAutoLoadingMore(false);
    }
  };

  const handleNextTrack = () => {
    if (isRepeat) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        ytPlayerRef.current.seekTo(0);
        ytPlayerRef.current.playVideo();
      }
      return;
    }
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(prev => prev.slice(1));
      playTrack(nextTrack);
      return;
    }
    const currentList = showLikedOnly ? likedSongs : displayedList;
    if (currentList.length === 0) return;
    const currentIdx = currentList.findIndex(t => t.title.toLowerCase() === (activeTrack?.title || '').toLowerCase());
    if (currentIdx !== -1 && currentIdx < currentList.length - 1) {
      playTrack(currentList[currentIdx + 1]);
    } else {
      playTrack(currentList[0]);
    }
  };

  const handlePrevTrack = () => {
    const currentList = showLikedOnly ? likedSongs : displayedList;
    if (currentList.length === 0) return;
    const currentIdx = currentList.findIndex(t => t.title.toLowerCase() === (activeTrack?.title || '').toLowerCase());
    if (currentIdx > 0) {
      playTrack(currentList[currentIdx - 1]);
    } else {
      playTrack(currentList[currentList.length - 1]);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { 
        ytPlayerRef.current.seekTo(time, true); 
      } catch (e) {}
    }
    if (audioRef.current) {
      try { audioRef.current.currentTime = time; } catch (e) {}
    }
  };

  const handleSkipSeconds = (delta) => {
    const target = Math.max(0, Math.min((duration || 210) - 1, currentTime + delta));
    setCurrentTime(target);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { 
        ytPlayerRef.current.seekTo(target, true); 
      } catch (e) {}
    }
    if (audioRef.current) {
      try { audioRef.current.currentTime = target; } catch (e) {}
    }
  };

  const handleSpeedCycle = () => {
    const currentIndex = SPEED_OPTIONS.findIndex(s => s.val === playbackSpeed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    const nextSpeed = SPEED_OPTIONS[nextIndex].val;
    setPlaybackSpeed(nextSpeed);

    if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
      try { ytPlayerRef.current.setPlaybackRate(nextSpeed); } catch (e) {}
    }
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
    showToast(`Speed: ${nextSpeed}x`);
  };

  const handleSoundModeCycle = () => {
    setSoundModeIndex((prev) => (prev + 1) % SOUND_MODES.length);
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
    const text = `Listen to "${vibeTitle}" on Joyson Music Spotify! 🎵 ${spotifyUrl || window.location.href}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setTracks(prev => {
      let shuffled = shuffleArray(prev);
      if (shuffled.length > 1 && prev.length > 0 && (shuffled[0].title || '').toLowerCase() === (prev[0].title || '').toLowerCase()) {
        const swapIdx = 1 + Math.floor(Math.random() * (shuffled.length - 1));
        [shuffled[0], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[0]];
      }
      if (shuffled.length > 0) {
        setCurrentTrack(shuffled[0]);
        if (isPlaying) {
          playTrack(shuffled[0]);
        }
      }
      showToast(`✨ Fresh Mix! Playing: ${shuffled[0]?.title || 'Shuffled Song'}`);
      return shuffled;
    });

    fetch("/api/playlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: mood || vibeTitle, shuffle: true }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.tracks && data.tracks.length > 0) {
        setTracks(prev => {
          const newSet = new Set(data.tracks.map(t => (t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')));
          const nonDupes = prev.filter(t => !newSet.has((t.title || '').toLowerCase().replace(/[^a-z0-9]/g, '')));
          return [...data.tracks, ...nonDupes];
        });
      }
    })
    .catch(() => {})
    .finally(() => setIsRefreshing(false));
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === null || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentSoundMode = SOUND_MODES[soundModeIndex];

  // Spotify Greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const SPOTIFY_QUICK_CARDS = [
    { title: "Liked Songs", desc: "Your Favorites", emoji: "❤️", query: "liked", color: "from-[#450af5] to-[#8e8ee5]", isLiked: true },
    { title: "Kannada Superhits", desc: "Sandalwood DJ Mix", emoji: "🟡", query: "Kannada", color: "from-amber-600 to-red-700" },
    { title: "Bollywood Party Hits", desc: "Top Hindi Club Remixes", emoji: "🇮🇳", query: "Hindi", color: "from-orange-600 to-rose-700" },
    { title: "Konkani Coastal Baila", desc: "Goan & Mangalore Classics", emoji: "🌴", query: "Konkani", color: "from-emerald-600 to-teal-700" },
    { title: "Telugu Blockbusters", desc: "Tollywood High-Bass Mass", emoji: "🕺", query: "Telugu", color: "from-purple-600 to-pink-700" },
    { title: "Global Billboard 50", desc: "Worldwide Synthwave & Pop", emoji: "🇺🇸", query: "English", color: "from-blue-600 to-indigo-700" }
  ];

  return (
    <div className="w-full space-y-6 pb-28 md:pb-24 font-sans text-white select-none">
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
        onTimeUpdate={() => {
          if (!isDraggingScrubberRef.current && audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
              setDuration(audioRef.current.duration);
            }
          }
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleNextTrack}
      />

      {/* Spotify Top Greeting & 6 Quick-Access Cards */}
      <div className="space-y-3">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {getGreeting()}
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
          {SPOTIFY_QUICK_CARDS.map((card, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (card.isLiked) {
                  setShowLikedOnly(true);
                } else if (onRefreshPlaylist) {
                  onRefreshPlaylist(card.query);
                }
              }}
              className="group relative flex items-center bg-[#242424]/80 hover:bg-[#2e2e2e] rounded-md overflow-hidden transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl border border-transparent hover:border-white/10"
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${card.color} flex items-center justify-center text-xl sm:text-2xl flex-shrink-0 font-bold shadow-inner`}>
                {card.emoji}
              </div>
              <div className="flex-1 px-3 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#1ed760] transition-colors">
                  {card.title}
                </p>
                <p className="text-[10px] sm:text-[11px] text-[#b3b3b3] truncate">
                  {card.desc}
                </p>
              </div>
              <div className="mr-3 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg hover:scale-105">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Authentic Spotify Playlist Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#282828] to-[#121212] p-5 sm:p-8 border border-white/5 shadow-2xl flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
        {/* Cover Art */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-lg overflow-hidden shadow-2xl flex-shrink-0 bg-[#282828] border border-white/10 group">
          <img 
            src={activeTrack?.artworkUrl || (activeTrack?.youtubeVideoId ? `https://i.ytimg.com/vi/${activeTrack.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80`)} 
            alt={vibeTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80`;
            }}
          />
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-white flex items-center gap-1">
            <span>{emoji}</span>
            <span>SPOTIFY</span>
          </div>
        </div>

        {/* Playlist Metadata */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white/70">
              PUBLIC PLAYLIST
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] border border-[#1ed760]/30">
              100% Free • Ad-Free
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
            {vibeTitle}
          </h1>

          <p className="text-xs sm:text-sm text-[#b3b3b3] line-clamp-2 max-w-2xl font-medium">
            {vibeDescription}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#b3b3b3] pt-1">
            <span className="font-bold text-white flex items-center gap-1.5">
              <SpotifyIcon className="w-4 h-4 text-[#1ed760]" />
              AuraBeat Spotify
            </span>
            <span>•</span>
            <span className="font-semibold">{displayedList.length} songs</span>
            <span>•</span>
            <span className="text-[#1ed760] font-semibold">{energy || "High Bitrate 320kbps"}</span>
          </div>
        </div>
      </div>

      {/* Spotify Action Bar: Big Green Play Button, Shuffle, Heart, Plus, Tools */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Spotify Giant Green Play Button */}
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all"
            title={isPlaying ? "Pause Playlist" : "Play Playlist"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Shuffle Toggle */}
          <button
            onClick={handleShuffle}
            className="p-2 text-[#b3b3b3] hover:text-[#1ed760] transition-colors"
            title="Shuffle Playlist"
          >
            <Shuffle className="w-6 h-6" />
          </button>

          {/* Like Current Track */}
          <button
            onClick={() => toggleLike(activeTrack)}
            className={`p-2 transition-colors ${isCurrentLiked ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
            title={isCurrentLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          >
            <Heart className={`w-6 h-6 ${isCurrentLiked ? "fill-[#1ed760]" : ""}`} />
          </button>

          {/* Add Track to Playlist */}
          <button
            onClick={() => setTrackForPlaylistModal(activeTrack)}
            className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
            title="Add to Playlist"
          >
            <Plus className="w-6 h-6" />
          </button>

          {/* Fresh Mix / Refresh */}
          <button
            onClick={handleRefreshAll}
            disabled={isRefreshing}
            className="p-2 text-[#b3b3b3] hover:text-[#1ed760] transition-colors disabled:opacity-50"
            title="Fresh Mix Shuffle"
          >
            <RotateCw className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          {/* Mobile Screen Wake Lock status toggle */}
          <button
            onClick={toggleWakeLock}
            className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all border ${
              wakeLockActive
                ? "bg-[#1ed760]/20 text-[#1ed760] border-[#1ed760]/40"
                : "text-[#b3b3b3] hover:text-white border-transparent hover:border-white/10"
            }`}
            title="Keep Phone Awake & Background Playing"
          >
            <Smartphone className={`w-5 h-5 ${wakeLockActive ? "animate-pulse" : ""}`} />
            <span className="hidden sm:inline">{wakeLockActive ? "Screen Awake ON" : "Screen Awake"}</span>
          </button>
        </div>

        {/* Right Tools: EQ, Visualizer, Cinema, Ambience */}
        <div className="flex items-center gap-2">
          {/* Visualizer */}
          <button
            onClick={() => setShowVisualizer(true)}
            className="px-3 py-1.5 bg-[#282828] hover:bg-[#333333] text-[#b3b3b3] hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
            title="3D Spectrum Beats Visualizer"
          >
            <Activity className="w-3.5 h-3.5 text-[#1ed760]" />
            <span className="hidden sm:inline">Visualizer</span>
          </button>

          {/* Equalizer */}
          <button
            onClick={() => setShowEqModal(true)}
            className="px-3 py-1.5 bg-[#282828] hover:bg-[#333333] text-[#b3b3b3] hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
            title="Pro 10-Band Equalizer"
          >
            <Sliders className="w-3.5 h-3.5 text-[#1ed760]" />
            <span className="hidden sm:inline">EQ</span>
          </button>

          {/* Cinema Mode */}
          <button
            onClick={() => setIsCinemaMode(true)}
            className="px-3 py-1.5 bg-[#282828] hover:bg-[#333333] text-[#b3b3b3] hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
            title="Fullscreen Cinema"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cinema</span>
          </button>

          {/* Ambience */}
          <button
            onClick={() => setShowAmbientModal(true)}
            className="px-3 py-1.5 bg-[#282828] hover:bg-[#333333] text-[#b3b3b3] hover:text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Ambience</span>
          </button>
        </div>
      </div>

      {/* Playlist Search Bar & Category Filter Chips */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat.id
                  ? "bg-white text-black border-white shadow"
                  : "bg-[#282828] text-[#b3b3b3] border-transparent hover:text-white hover:bg-[#333333]"
              }`}
            >
              {cat.label}
            </button>
          ))}
          {/* Favorites only filter */}
          <button
            onClick={() => setShowLikedOnly(!showLikedOnly)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              showLikedOnly
                ? "bg-[#1ed760] text-black border-[#1ed760]"
                : "bg-[#282828] text-[#b3b3b3] border-transparent hover:text-white"
            }`}
          >
            ❤️ Liked ({likedSongs.length})
          </button>
        </div>

        {/* Filter Input */}
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search in playlist..."
            className="w-full pl-9 pr-4 py-1.5 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#282828] border border-transparent focus:border-white/20 rounded-full text-xs text-white placeholder-[#727272] focus:outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-[#b3b3b3] absolute left-3.5 top-2.5" />
          {filterQuery && (
            <button
              onClick={() => setFilterQuery("")}
              className="absolute right-3 top-2 text-[#b3b3b3] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Synchronized Karaoke Lyrics (Collapsible/Drawer) */}
      {showLyrics && (
        <div className="bg-[#181818] border border-[#282828] rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#282828]">
            <div className="flex items-center gap-2">
              <Mic2 className="w-5 h-5 text-[#1ed760]" />
              <h4 className="text-sm font-extrabold text-white">
                Live Karaoke Lyrics: <span className="text-[#1ed760] font-normal">{activeTrack?.title}</span>
              </h4>
            </div>
            <button 
              onClick={() => setShowLyrics(false)}
              className="p-1.5 text-[#b3b3b3] hover:text-white bg-[#282828] rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {loadingLyrics ? (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[#b3b3b3]">
              <Loader2 className="w-6 h-6 animate-spin text-[#1ed760]" />
              <span>Fetching synchronized lyrics...</span>
            </div>
          ) : lyrics.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#b3b3b3]">
              No lyrics found for this track. Enjoy the music vibe! 🎵
            </div>
          ) : (
            <div 
              ref={lyricsContainerRef}
              className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-thin scroll-smooth"
            >
              {lyrics.map((line, idx) => {
                const isActive = idx === activeLyricIndex;
                const isPast = idx < activeLyricIndex;
                return (
                  <div
                    key={idx}
                    ref={isActive ? activeLyricRef : null}
                    onClick={() => handleSeekToTime(line.time)}
                    className={`cursor-pointer px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between ${
                      isActive
                        ? "bg-[#1ed760]/20 text-[#1ed760] font-black text-base scale-[1.01]"
                        : isPast
                          ? "text-[#6a6a6a] text-xs hover:text-[#b3b3b3]"
                          : "text-[#b3b3b3] text-sm hover:text-white"
                    }`}
                  >
                    <span>{line.text}</span>
                    <span className="text-[10px] font-mono text-[#6a6a6a]">{formatTime(line.time)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Authentic Spotify Song Table */}
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#b3b3b3] border-b border-[#282828]">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6 md:col-span-5">Title</div>
          <div className="hidden md:block col-span-3">Album / Vibe</div>
          <div className="col-span-3 md:col-span-2 text-right">Duration</div>
          <div className="col-span-2 md:col-span-1 text-right">Action</div>
        </div>

        {/* Table Rows */}
        {displayedList.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#b3b3b3]">
            {showLikedOnly 
              ? "No liked songs yet! Click the ❤️ heart icon on any track to save it here."
              : filterQuery
                ? `No songs found matching "${filterQuery}".`
                : "No tracks available in this category."}
          </div>
        ) : (
          <div 
            onScroll={(e) => {
              const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
              if (scrollTop + clientHeight >= scrollHeight - 350 && !autoLoadingMore && !showLikedOnly && !filterQuery) {
                loadMoreSongs();
              }
            }}
            className="space-y-0.5 max-h-[680px] overflow-y-auto scrollbar-thin pt-1"
          >
            {displayedList.map((track, idx) => {
              const isThisSelected = activeTrack && (activeTrack.title.toLowerCase() === track.title.toLowerCase());
              const isLiked = likedSongs.some(t => t.title.toLowerCase() === track.title.toLowerCase());

              return (
                <div
                  key={idx}
                  onClick={() => playTrack(track)}
                  className={`group grid grid-cols-12 gap-3 items-center px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    isThisSelected 
                      ? "bg-[#282828]" 
                      : "hover:bg-[#282828]/60"
                  }`}
                >
                  {/* # Column */}
                  <div className="col-span-1 flex items-center justify-center font-mono text-xs">
                    {isThisSelected && isPlaying ? (
                      <span className="flex items-end gap-0.5 h-3">
                        <span className="w-1 bg-[#1ed760] h-full animate-bounce" />
                        <span className="w-1 bg-[#1ed760] h-2/3 animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1 bg-[#1ed760] h-full animate-bounce [animation-delay:0.4s]" />
                      </span>
                    ) : (
                      <span className={`group-hover:hidden ${isThisSelected ? "text-[#1ed760] font-bold" : "text-[#b3b3b3]"}`}>
                        {idx + 1}
                      </span>
                    )}
                    <Play className={`w-3.5 h-3.5 fill-current hidden group-hover:block ${isThisSelected ? "text-[#1ed760]" : "text-white"}`} />
                  </div>

                  {/* Title & Artist & Artwork Column */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0">
                    <img 
                      src={track.artworkUrl || (track.youtubeVideoId ? `https://i.ytimg.com/vi/${track.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80`)} 
                      alt={track.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0 bg-[#282828]"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80`;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold truncate ${isThisSelected ? "text-[#1ed760]" : "text-white group-hover:underline"}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Album / Vibe Column (Desktop only) */}
                  <div className="hidden md:block col-span-3 text-xs text-[#b3b3b3] truncate">
                    {track.album || track.genre || vibeTitle}
                  </div>

                  {/* Duration Column */}
                  <div className="col-span-3 md:col-span-2 text-right font-mono text-xs text-[#b3b3b3]">
                    {track.duration || "3:30"}
                  </div>

                  {/* Action Icons Column */}
                  <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                    {/* Add to Playlist (+) */}
                    <button
                      onClick={() => setTrackForPlaylistModal(track)}
                      className="p-1.5 text-[#b3b3b3] hover:text-white rounded transition-colors"
                      title="Add to Playlist"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Like Heart */}
                    <button
                      onClick={() => toggleLike(track)}
                      className={`p-1.5 rounded transition-colors ${isLiked ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
                      title={isLiked ? "Unlike" : "Like"}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-[#1ed760]" : ""}`} />
                    </button>
                  </div>
                </div>
              );
            })}

            {autoLoadingMore && (
              <div className="py-4 text-center text-xs text-[#1ed760] font-bold flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading more tracks from 100M+ music catalog...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          AUTHENTIC SPOTIFY FIXED BOTTOM PLAYER BAR (DESKTOP)
          ========================================================================= */}
      {activeTrack && (
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-20 bg-[#181818] border-t border-[#282828] z-50 px-4 items-center justify-between shadow-2xl">
          {/* Left Column: Artwork + Title + Artist + Like + Add */}
          <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
            <img 
              src={activeTrack.artworkUrl || (activeTrack.youtubeVideoId ? `https://i.ytimg.com/vi/${activeTrack.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80`)} 
              alt={activeTrack.title}
              className="w-14 h-14 rounded object-cover shadow bg-[#282828]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate hover:underline cursor-pointer">
                {activeTrack.title}
              </p>
              <p className="text-xs text-[#b3b3b3] truncate hover:underline cursor-pointer">
                {activeTrack.artist}
              </p>
            </div>
            <button
              onClick={() => toggleLike(activeTrack)}
              className={`p-1.5 transition-colors ${isCurrentLiked ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
              title="Save to Liked Songs"
            >
              <Heart className={`w-4 h-4 ${isCurrentLiked ? "fill-[#1ed760]" : ""}`} />
            </button>
            <button
              onClick={() => setTrackForPlaylistModal(activeTrack)}
              className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
              title="Add to Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Center Column: Player Controls + Scrubber Bar */}
          <div className="flex flex-col items-center justify-center w-2/4 max-w-xl gap-1">
            {/* Top Buttons: Shuffle, Prev, Play/Pause, Next, Repeat */}
            <div className="flex items-center gap-4">
              <button
                onClick={handleShuffle}
                className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrevTrack}
                className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
                title="Previous"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={handleNextTrack}
                className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
                title="Next"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                className={`p-1.5 transition-colors ${isRepeat ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
                title="Repeat"
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Scrubber: Time, Slider, Duration */}
            <div className="flex items-center gap-2.5 w-full text-[11px] font-mono text-[#b3b3b3]">
              <span className="w-10 text-right">{formatTime(currentTime)}</span>
              <input 
                type="range"
                min="0"
                max={duration || 210}
                step="0.5"
                value={currentTime}
                onMouseDown={() => { isDraggingScrubberRef.current = true; }}
                onTouchStart={() => { isDraggingScrubberRef.current = true; }}
                onMouseUp={() => { isDraggingScrubberRef.current = false; }}
                onTouchEnd={() => { isDraggingScrubberRef.current = false; }}
                onChange={handleSeek}
                className="w-full h-1 bg-[#4d4d4d] hover:bg-[#1ed760] accent-[#1ed760] rounded-full appearance-none cursor-pointer transition-colors"
              />
              <span className="w-10">{formatTime(duration || 210)}</span>
            </div>
          </div>

          {/* Right Column: Lyrics, Queue, Speed, WakeLock, Volume */}
          <div className="flex items-center justify-end gap-3 w-1/4 min-w-[200px]">
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-1.5 transition-colors ${showLyrics ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
              title="Lyrics"
            >
              <Mic2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowQueueModal(true)}
              className="p-1.5 text-[#b3b3b3] hover:text-white transition-colors"
              title="Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              onClick={handleSpeedCycle}
              className="px-2 py-0.5 rounded text-[11px] font-bold text-[#b3b3b3] hover:text-white bg-[#282828] transition-colors"
              title="Playback Speed"
            >
              {playbackSpeed}x
            </button>

            {/* Screen Wake Lock Button */}
            <button
              onClick={toggleWakeLock}
              className={`p-1.5 rounded transition-colors ${wakeLockActive ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}`}
              title="Keep Screen Awake (Continuous Play)"
            >
              <Smartphone className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button onClick={toggleMute} className="text-[#b3b3b3] hover:text-white">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-[#4d4d4d] accent-[#1ed760] rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          AUTHENTIC SPOTIFY MOBILE MINI-PLAYER BAR (MOBILE)
          Sits directly above bottom navigation bar at bottom-16
          ========================================================================= */}
      {activeTrack && (
        <div 
          onClick={() => setShowMobileNowPlaying(true)}
          className="md:hidden fixed bottom-16 left-2 right-2 h-14 bg-[#242424] border border-white/5 rounded-lg z-40 px-3 flex items-center justify-between shadow-2xl cursor-pointer"
        >
          {/* Hairline Progress Bar along the top of the mini-player */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 rounded-t-lg overflow-hidden">
            <div 
              className="h-full bg-[#1ed760]" 
              style={{ width: `${Math.min(100, (currentTime / (duration || 210)) * 100)}%` }} 
            />
          </div>

          {/* Left: Artwork + Title + Artist */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img 
              src={activeTrack.artworkUrl || (activeTrack.youtubeVideoId ? `https://i.ytimg.com/vi/${activeTrack.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100`)} 
              alt={activeTrack.title}
              className="w-10 h-10 rounded object-cover flex-shrink-0 bg-[#181818]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{activeTrack.title}</p>
              <p className="text-[11px] text-[#b3b3b3] truncate">{activeTrack.artist}</p>
            </div>
          </div>

          {/* Right: Like + Play/Pause */}
          <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => toggleLike(activeTrack)}
              className={`p-2 ${isCurrentLiked ? "text-[#1ed760]" : "text-[#b3b3b3]"}`}
            >
              <Heart className={`w-5 h-5 ${isCurrentLiked ? "fill-[#1ed760]" : ""}`} />
            </button>
            <button
              onClick={togglePlay}
              className="p-2 text-white hover:scale-105"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          SPOTIFY MOBILE FULL-SCREEN NOW-PLAYING DRAWER / VIEW
          ========================================================================= */}
      {showMobileNowPlaying && activeTrack && (
        <div className="md:hidden fixed inset-0 z-50 bg-gradient-to-b from-[#2e2e2e] via-[#121212] to-[#121212] p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-bottom duration-300">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4">
            <button 
              onClick={() => setShowMobileNowPlaying(false)}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <ChevronDown className="w-6 h-6" />
            </button>

            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#b3b3b3]">PLAYING FROM PLAYLIST</p>
              <p className="text-xs font-bold text-white truncate max-w-[200px]">{vibeTitle}</p>
            </div>

            <button 
              onClick={() => setTrackForPlaylistModal(activeTrack)}
              className="p-2 text-white hover:bg-white/10 rounded-full"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>

          {/* Center Giant Artwork */}
          <div className="my-auto py-6 flex flex-col items-center">
            <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden shadow-2xl bg-[#181818] border border-white/10">
              <img 
                src={activeTrack.artworkUrl || (activeTrack.youtubeVideoId ? `https://i.ytimg.com/vi/${activeTrack.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600`)} 
                alt={activeTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Title + Artist + Like */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3">
                <h3 className="text-xl font-bold text-white truncate">{activeTrack.title}</h3>
                <p className="text-sm text-[#b3b3b3] truncate">{activeTrack.artist}</p>
              </div>
              <button
                onClick={() => toggleLike(activeTrack)}
                className={`p-2 ${isCurrentLiked ? "text-[#1ed760]" : "text-[#b3b3b3]"}`}
              >
                <Heart className={`w-7 h-7 ${isCurrentLiked ? "fill-[#1ed760]" : ""}`} />
              </button>
            </div>

            {/* Scrubber */}
            <div className="space-y-1">
              <input 
                type="range"
                min="0"
                max={duration || 210}
                step="0.5"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 accent-[#1ed760] rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#b3b3b3]">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration || 210)}</span>
              </div>
            </div>

            {/* Main Playback Controls: Shuffle, Prev, Big Play, Next, Repeat */}
            <div className="flex items-center justify-between px-2 pt-2">
              <button onClick={handleShuffle} className="p-2 text-[#b3b3b3] hover:text-white">
                <Shuffle className="w-6 h-6" />
              </button>

              <button onClick={handlePrevTrack} className="p-2 text-white">
                <SkipBack className="w-8 h-8 fill-current" />
              </button>

              <button 
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-95"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>

              <button onClick={handleNextTrack} className="p-2 text-white">
                <SkipForward className="w-8 h-8 fill-current" />
              </button>

              <button 
                onClick={() => setIsRepeat(!isRepeat)} 
                className={`p-2 ${isRepeat ? "text-[#1ed760]" : "text-[#b3b3b3]"}`}
              >
                <Repeat className="w-6 h-6" />
              </button>
            </div>

            {/* Bottom Actions: Lyrics, Speed, WakeLock, Close */}
            <div className="flex items-center justify-around pt-4 border-t border-white/10 text-xs">
              <button 
                onClick={() => {
                  setShowMobileNowPlaying(false);
                  setShowLyrics(true);
                }}
                className="flex flex-col items-center gap-1 text-[#b3b3b3] hover:text-white"
              >
                <Mic2 className="w-5 h-5 text-[#1ed760]" />
                <span>Lyrics</span>
              </button>

              <button 
                onClick={toggleWakeLock}
                className={`flex flex-col items-center gap-1 ${wakeLockActive ? "text-[#1ed760]" : "text-[#b3b3b3]"}`}
              >
                <Smartphone className="w-5 h-5" />
                <span>{wakeLockActive ? "Awake: ON" : "Awake: OFF"}</span>
              </button>

              <button 
                onClick={handleSpeedCycle}
                className="flex flex-col items-center gap-1 text-[#b3b3b3]"
              >
                <Gauge className="w-5 h-5" />
                <span>{playbackSpeed}x</span>
              </button>

              <button 
                onClick={() => {
                  setShowMobileNowPlaying(false);
                  setShowQueueModal(true);
                }}
                className="flex flex-col items-center gap-1 text-[#b3b3b3]"
              >
                <ListMusic className="w-5 h-5" />
                <span>Queue</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          "ADD TO PLAYLIST" MODAL
          ========================================================================= */}
      {trackForPlaylistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
              <div>
                <h3 className="text-base font-bold text-white">Add to Playlist</h3>
                <p className="text-xs text-[#b3b3b3] truncate max-w-[220px]">{trackForPlaylistModal.title}</p>
              </div>
              <button 
                onClick={() => setTrackForPlaylistModal(null)}
                className="p-1.5 text-[#b3b3b3] hover:text-white bg-[#282828] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Create new playlist button */}
            <button
              onClick={() => {
                setTrackForPlaylistModal(null);
                if (onCreatePlaylist) onCreatePlaylist();
              }}
              className="w-full py-2.5 px-3 bg-[#242424] hover:bg-[#2e2e2e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <FolderPlus className="w-4 h-4 text-[#1ed760]" />
              <span>+ Create New Playlist</span>
            </button>

            {/* Existing User Playlists */}
            <div className="space-y-1.5 max-h-60 overflow-y-auto scrollbar-thin">
              {userPlaylists.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#b3b3b3]">
                  No custom playlists created yet. Click "+ Create New Playlist" to start your library!
                </div>
              ) : (
                userPlaylists.map((pl) => (
                  <button
                    key={pl.id}
                    onClick={() => {
                      if (onAddTrackToPlaylist) {
                        onAddTrackToPlaylist(pl.id, trackForPlaylistModal);
                        showToast(`Added to "${pl.title}"! 🎵`);
                      }
                      setTrackForPlaylistModal(null);
                    }}
                    className="w-full p-2.5 text-left rounded-xl bg-[#121212] hover:bg-[#242424] text-white flex items-center justify-between gap-3 border border-transparent hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg">{pl.emoji || "🎵"}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate">{pl.title}</p>
                        <p className="text-[10px] text-[#b3b3b3]">{pl.tracks?.length || 0} songs</p>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-[#1ed760] flex-shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Up Next Queue Modal */}
      {showQueueModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#282828] rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-[#1ed760]" />
                <span>Up Next Queue ({queue.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="px-2.5 py-1 text-[#b3b3b3] hover:text-rose-400 hover:bg-[#282828] rounded-xl text-xs flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
                <button onClick={() => setShowQueueModal(false)} className="text-[#b3b3b3] hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {queue.length === 0 ? (
              <div className="py-12 text-center text-[#b3b3b3] text-xs">
                Your queue is empty! Click the <b>+</b> button on any track to queue it.
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-1 flex-1 scrollbar-thin">
                {queue.map((track, qIdx) => (
                  <div
                    key={qIdx}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#121212] border border-[#282828]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-xs font-mono font-bold text-[#1ed760] w-5">#{qIdx + 1}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">{track.title}</div>
                        <div className="text-[11px] text-[#b3b3b3] truncate">{track.artist}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => playQueueTrack(qIdx)}
                        className="px-2.5 py-1 bg-[#1ed760] text-black rounded-lg text-xs font-bold"
                      >
                        Play
                      </button>
                      <button
                        onClick={() => removeFromQueue(qIdx)}
                        className="p-1.5 text-[#b3b3b3] hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ambient Soundscapes Mixer Modal */}
      {showAmbientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-cyan-400" />
                <span>Ambient Sound Mixer</span>
              </h3>
              <button onClick={() => setShowAmbientModal(false)} className="text-[#b3b3b3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { key: 'rain', label: 'Rain', color: 'text-cyan-400', icon: CloudRain },
                { key: 'waves', label: 'Ocean Waves', color: 'text-blue-400', icon: Waves },
                { key: 'fire', label: 'Campfire', color: 'text-amber-400', icon: Flame },
                { key: 'coffee', label: 'Cafe Chatter', color: 'text-orange-400', icon: Coffee }
              ].map(({ key, label, color, icon: IconComponent }) => (
                <div key={key} className="flex items-center justify-between gap-3 bg-[#121212] p-3 rounded-xl border border-[#282828]">
                  <div className={`flex items-center gap-2 text-xs font-semibold ${color} w-28`}>
                    <IconComponent className="w-4 h-4" />
                    <span>{label}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={ambientVolumes[key]}
                    onChange={(e) => handleAmbientChange(key, parseFloat(e.target.value))}
                    className="flex-1 accent-[#1ed760] cursor-pointer"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setAmbientVolumes({ rain: 0, waves: 0, fire: 0, coffee: 0 });
                ambientSynth.stopAll();
              }}
              className="w-full py-2.5 bg-[#282828] hover:bg-[#333333] text-[#b3b3b3] rounded-xl text-xs font-bold transition-all"
            >
              Turn Off All Ambience
            </button>
          </div>
        </div>
      )}

      {/* 3D Visualizer Modal */}
      <BeatsVisualizerModal
        isOpen={showVisualizer}
        onClose={() => setShowVisualizer(false)}
        isPlaying={isPlaying}
        track={activeTrack}
        colorTheme={colorTheme}
      />

      {/* Graphic Equalizer Modal */}
      <EqualizerModal
        isOpen={showEqModal}
        onClose={() => setShowEqModal(false)}
        eqGains={eqGains}
        onGainChange={handleGainChange}
        onSelectPreset={handleSelectPreset}
        currentPreset={selectedEqPreset}
      />

      {/* Fullscreen Cinema Mode */}
      {isCinemaMode && activeTrack && (
        <div className="fixed inset-0 z-50 bg-[#121212]/98 backdrop-blur-2xl flex flex-col items-center justify-between p-6 sm:p-12 text-white animate-in fade-in duration-300">
          <div className="w-full flex items-center justify-between">
            <span className="text-sm font-bold text-[#1ed760]">AuraBeat Spotify Cinema Mode</span>
            <button
              onClick={() => setIsCinemaMode(false)}
              className="p-2.5 bg-[#282828] text-white rounded-xl border border-white/10 flex items-center gap-1.5 text-xs font-bold"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Exit (Esc / F)</span>
            </button>
          </div>

          <div className="relative flex flex-col items-center my-auto space-y-6 text-center">
            <div className={`w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden shadow-2xl border-4 border-[#282828] transition-transform duration-700 ${isPlaying ? "scale-105 ring-4 ring-[#1ed760]/50" : ""}`}>
              <img 
                src={activeTrack.artworkUrl || (activeTrack.youtubeVideoId ? `https://i.ytimg.com/vi/${activeTrack.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600`)} 
                alt={activeTrack.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-white">{activeTrack.title}</h2>
              <p className="text-base text-[#b3b3b3] mt-1">{activeTrack.artist}</p>
            </div>
          </div>

          <div className="w-full max-w-2xl space-y-4">
            <input 
              type="range"
              min="0"
              max={duration || 210}
              step="0.5"
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-[#282828] accent-[#1ed760] rounded-full cursor-pointer"
            />
            <div className="flex items-center justify-center gap-6">
              <button onClick={handlePrevTrack} className="p-3 bg-[#282828] text-white rounded-full">
                <SkipBack className="w-6 h-6 fill-current" />
              </button>
              <button onClick={togglePlay} className="p-5 bg-[#1ed760] text-black rounded-full shadow-2xl">
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
              <button onClick={handleNextTrack} className="p-3 bg-[#282828] text-white rounded-full">
                <SkipForward className="w-6 h-6 fill-current" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-24 right-6 z-50 bg-[#181818] border border-[#1ed760]/60 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom duration-200">
          <Sparkles className="w-4 h-4 text-[#1ed760]" />
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
