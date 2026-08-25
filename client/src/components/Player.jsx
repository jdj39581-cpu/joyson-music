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
  Repeat 
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

function parseDurationToSeconds(durationStr) {
  if (!durationStr) return 210;
  const parts = durationStr.split(":");
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  return 210;
}

export default function Player({ playlist }) {
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
  const [duration, setDuration] = useState(210);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  const ytPlayerRef = useRef(null);
  const ytDeckRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const playerSectionRef = useRef(null);
  const isRepeatRef = useRef(false);
  const currentVideoIdRef = useRef(null);

  useEffect(() => {
    isRepeatRef.current = isRepeat;
  }, [isRepeat]);

  useEffect(() => {
    setTracks(initialTracks);
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    setCurrentTime(0);
    const initialDur = parseDurationToSeconds(initialTracks[0]?.duration);
    setDuration(initialDur);
  }, [playlist, initialTracks]);

  const activeTrack = tracks[currentTrackIndex] || tracks[0] || null;

  // Load YouTube Iframe API once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Initialize Full Master Audio Engine (Direct and Loud Sound Output)
  useEffect(() => {
    const initPlayer = () => {
      if (ytPlayerRef.current || !window.YT || !window.YT.Player || !ytDeckRef.current) return;

      const firstTrack = initialTracks[0];
      const initialId = firstTrack?.youtubeVideoId || firstTrack?.candidateVideoIds?.[0] || "udra3Mfw2oo";
      currentVideoIdRef.current = initialId;

      ytPlayerRef.current = new window.YT.Player(ytDeckRef.current, {
        height: "100%",
        width: "100%",
        videoId: initialId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            event.target.unMute();
            event.target.setVolume(volume * 100);
          },
          onStateChange: (event) => {
            // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
            if (event.data === 1) {
              setIsPlaying(true);
              setIsBuffering(false);
              const dur = event.target.getDuration();
              if (dur > 0) setDuration(dur);
            } else if (event.data === 2) {
              setIsPlaying(false);
              setIsBuffering(false);
            } else if (event.data === 3) {
              setIsBuffering(true);
            } else if (event.data === 0) {
              setIsPlaying(false);
              setIsBuffering(false);
              if (isRepeatRef.current && ytPlayerRef.current) {
                ytPlayerRef.current.seekTo(0, true);
                ytPlayerRef.current.playVideo();
              } else {
                handleNextTrack();
              }
            }
          },
          onError: (err) => {
            console.warn("Audio Engine notice:", err.data);
            setIsBuffering(false);
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }
  }, []);

  // Track progress interval for full song audio
  useEffect(() => {
    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          const curr = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (curr !== undefined) setCurrentTime(curr);
          if (dur !== undefined && dur > 0) {
            setDuration(dur);
          }
        }
      }, 300);
    } else {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPlaying]);

  // Guaranteed Click-to-Play Full 3-5 Minute Track
  const playTrackAtIndex = (index) => {
    if (index < 0 || index >= tracks.length) return;
    const track = tracks[index];
    if (!track) return;

    setCurrentTrackIndex(index);
    setCurrentTime(0);
    const parsedDur = parseDurationToSeconds(track.duration);
    setDuration(parsedDur);
    setIsBuffering(true);

    const targetVideoId = track.youtubeVideoId || track.candidateVideoIds?.[0];

    if (targetVideoId) {
      currentVideoIdRef.current = targetVideoId;
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume((isMuted ? 0 : volume) * 100);
        ytPlayerRef.current.loadVideoById({
          videoId: targetVideoId,
          startSeconds: 0,
        });
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        setIsBuffering(false);
      }
    } else {
      // Resolve on demand
      fetch(`/api/candidate-videos?title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`)
        .then(res => res.json())
        .then(data => {
          if (data.videoId) {
            setTracks(prev => {
              const copy = [...prev];
              if (copy[index]) {
                copy[index] = {
                  ...copy[index],
                  youtubeVideoId: data.videoId,
                  candidateVideoIds: data.videoIds || [data.videoId],
                };
              }
              return copy;
            });
            if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === "function") {
              ytPlayerRef.current.unMute();
              ytPlayerRef.current.setVolume((isMuted ? 0 : volume) * 100);
              ytPlayerRef.current.loadVideoById({
                videoId: data.videoId,
                startSeconds: 0,
              });
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
              setIsBuffering(false);
            }
          }
        })
        .catch(e => console.warn(e));
    }

    if (playerSectionRef.current) {
      playerSectionRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const togglePlay = () => {
    if (!ytPlayerRef.current) return;
    const track = tracks[currentTrackIndex];
    const targetVideoId = track?.youtubeVideoId || track?.candidateVideoIds?.[0];

    if (isPlaying) {
      if (typeof ytPlayerRef.current.pauseVideo === "function") {
        ytPlayerRef.current.pauseVideo();
      }
      setIsPlaying(false);
    } else {
      if (targetVideoId && currentVideoIdRef.current !== targetVideoId) {
        currentVideoIdRef.current = targetVideoId;
        ytPlayerRef.current.loadVideoById({
          videoId: targetVideoId,
          startSeconds: 0,
        });
      }
      if (typeof ytPlayerRef.current.playVideo === "function") {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume((isMuted ? 0 : volume) * 100);
        ytPlayerRef.current.playVideo();
      }
      setIsPlaying(true);
    }
  };

  const handleNextTrack = () => {
    if (isRepeatRef.current && ytPlayerRef.current) {
      ytPlayerRef.current.seekTo(0, true);
      ytPlayerRef.current.playVideo();
      return;
    }
    if (currentTrackIndex < tracks.length - 1) {
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

  // Instant Timeline Scrubbing / Seeking to exact second
  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
      ytPlayerRef.current.seekTo(time, true);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
      ytPlayerRef.current.setVolume(val * 100);
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!ytPlayerRef.current) return;
    if (isMuted) {
      ytPlayerRef.current.unMute();
      ytPlayerRef.current.setVolume((volume || 0.85) * 100);
      setIsMuted(false);
    } else {
      ytPlayerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleCopyLink = () => {
    const text = `Listen to "${vibeTitle}" AI Mood Playlist on AuraBeat! 🎵 ${spotifyUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Load 10+ more unique songs from catalog
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

  const fullTrackDuration = duration > 30 ? duration : (parseDurationToSeconds(activeTrack?.duration) || 210);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
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
                AI Music Mix
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
          <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end">
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

        {/* Summary Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] sm:text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Radio className="w-3.5 h-3.5" />
            <span>{tracks.length} Songs Loaded</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-300 font-bold">
            <Music className="w-3.5 h-3.5" />
            <span>Full 3–5 Minute Continuous Playback</span>
          </div>
        </div>
      </div>

      {/* Main Beautiful Pure Audio Player (100% Identical Layout to Screenshot) */}
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
            {/* Vinyl Album Art with Embedded Master Audio Deck inside */}
            <div className="relative group flex-shrink-0">
              <div className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700 bg-slate-800 transition-transform duration-500 ${isPlaying ? "scale-105 shadow-emerald-500/25 ring-2 ring-emerald-500/50" : ""}`}>
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

                {/* Master Audio Deck Container (Positioned inside active vinyl with opacity 0.001 to ensure browser output mixer stays 100% active!) */}
                <div 
                  ref={ytDeckRef}
                  className="absolute inset-0 w-full h-full opacity-[0.001] pointer-events-none z-0"
                />
              </div>

              {/* Pulsing play badge */}
              {isPlaying && (
                <span className="absolute -bottom-2 -right-2 flex h-5 w-5 z-20">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500 border-2 border-slate-900" />
                </span>
              )}
            </div>

            {/* Song Details & Pure Audio Controls */}
            <div className="flex-1 w-full flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Now Playing
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    • {activeTrack.duration || formatTime(fullTrackDuration)}
                  </span>
                  {isBuffering && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" /> Playing Full Song…
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

              {/* Interactive Timeline Scrubber (Full 3-5 Minutes with instant seeking) */}
              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="text-emerald-400 font-bold">{formatTime(currentTime)}</span>
                  <span>{formatTime(fullTrackDuration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={fullTrackDuration}
                  step="1"
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
                    title={isPlaying ? "Pause Song" : "Play Song"}
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

                {/* Live Animated Equalizer & Volume */}
                <div className="flex items-center gap-4">
                  {/* Equalizer Soundwave */}
                  <div className="hidden sm:flex items-end gap-1 h-6 px-3 py-1 bg-slate-950/70 rounded-xl border border-slate-800">
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isPlaying ? "h-5 animate-pulse" : "h-1.5"}`} />
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isPlaying ? "h-3 animate-pulse" : "h-2"}`} />
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isPlaying ? "h-6 animate-pulse" : "h-1"}`} />
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isPlaying ? "h-4 animate-pulse" : "h-3"}`} />
                    <span className={`w-1 bg-emerald-400 rounded-full transition-all duration-150 ${isPlaying ? "h-2 animate-pulse" : "h-1.5"}`} />
                  </div>

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

              {/* External Links (Spotify & YouTube) */}
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

      {/* Recommended Track List */}
      <div className="bg-slate-900/95 rounded-3xl border border-slate-800 p-3.5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-800">
          <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            <span>Playlist Songs ({tracks.length})</span>
          </h3>
          <span className="text-[11px] text-slate-400">Tap any song to play full 3–5 min song</span>
        </div>

        <div className="space-y-2">
          {tracks.map((track, idx) => {
            const isThisSelected = currentTrackIndex === idx;

            return (
              <div
                key={idx}
                onClick={() => playTrackAtIndex(idx)}
                className={`group relative flex items-center justify-between gap-2.5 p-2.5 sm:p-3.5 rounded-2xl transition-all duration-150 border cursor-pointer ${
                  isThisSelected
                    ? "bg-slate-800/95 border-emerald-500/70 shadow-md shadow-emerald-500/10"
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

                  {/* Song Title & Artist */}
                  <div className="flex-1 min-w-0 pr-1">
                    <h4 className={`text-xs sm:text-sm font-bold truncate leading-tight ${isThisSelected ? "text-emerald-400 font-extrabold" : "text-white"}`}>
                      {track.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate mt-0.5">
                      <span className="font-medium text-slate-300 truncate">{track.artist}</span>
                      {track.duration && (
                        <span className="font-mono text-slate-400 text-[10px] flex-shrink-0">
                          • {track.duration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
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
                    title="Play Audio"
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

        {/* Load More Songs Button */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-slate-800 to-slate-800/90 hover:from-slate-700 hover:to-slate-700/90 border border-slate-700 hover:border-emerald-500/60 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Fetching More Songs…</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Load More Songs for this Mood</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
