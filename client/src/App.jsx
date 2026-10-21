// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import Player from "./components/Player.jsx";
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Heart, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Smartphone, 
  QrCode, 
  X, 
  Copy, 
  Check, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Mic, 
  Flame,
  Globe2,
  Headphones,
  Music,
  FolderPlus,
  Play,
  Loader2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const HISTORY_KEY = "aurabeat_mood_history";
const PLAYLISTS_KEY = "aurabeat_user_playlists";

const SPOTIFY_PLAYLISTS = [
  { id: "kannada", title: "Kannada Superhits", desc: "Sandalwood Mass DJ Mix", emoji: "🟡", query: "Kannada", color: "from-amber-600 to-red-700", count: "30 tracks" },
  { id: "hindi", title: "Bollywood Party Hits", desc: "Top Hindi Club Remixes", emoji: "🇮🇳", query: "Hindi", color: "from-orange-600 to-rose-700", count: "27 tracks" },
  { id: "konkani", title: "Konkani Coastal Baila", desc: "Goan & Mangalore Classics", emoji: "🌴", query: "Konkani", color: "from-emerald-600 to-teal-700", count: "20 tracks" },
  { id: "telugu", title: "Telugu Blockbusters", desc: "Tollywood High-Bass Mass", emoji: "🕺", query: "Telugu", color: "from-purple-600 to-pink-700", count: "18 tracks" },
  { id: "malayalam", title: "Malayalam Viral Beats", desc: "Mollywood Party Anthems", emoji: "🥥", query: "Malayalam", color: "from-teal-600 to-emerald-700", count: "14 tracks" },
  { id: "tamil", title: "Tamil Mass Kuthu", desc: "Kollywood Dance Bangers", emoji: "✨", query: "Tamil", color: "from-orange-600 to-red-700", count: "15 tracks" },
  { id: "punjabi", title: "Punjabi Trap Hits", desc: "Urban Punjabi Hip-Hop DJ", emoji: "👳", query: "Punjabi", color: "from-rose-600 to-amber-700", count: "15 tracks" },
  { id: "english", title: "Global Billboard 50", desc: "Worldwide Synthwave & Pop", emoji: "🇺🇸", query: "English", color: "from-blue-600 to-indigo-700", count: "14 tracks" }
];

const SPOTIFY_BROWSE_TILES = [
  { title: "Today's Top Hits", query: "Top Hits 2024", color: "from-emerald-600 to-teal-800", emoji: "🔥" },
  { title: "Global Top 50", query: "Global Top 50", color: "from-blue-600 to-indigo-800", emoji: "🇺🇸" },
  { title: "Viral 50 Worldwide", query: "Viral Hits Worldwide", color: "from-violet-600 to-purple-800", emoji: "🚀" },
  { title: "Kannada Mass & DJ", query: "Kannada", color: "from-amber-600 to-red-700", emoji: "🟡" },
  { title: "Bollywood Butter", query: "Hindi", color: "from-orange-600 to-rose-700", emoji: "🇮🇳" },
  { title: "Konkani Coastal Baila", query: "Konkani", color: "from-teal-600 to-cyan-800", emoji: "🌴" },
  { title: "Tollywood Blockbusters", query: "Telugu", color: "from-purple-600 to-pink-700", emoji: "🕺" },
  { title: "Mollywood Chill & Beats", query: "Malayalam", color: "from-emerald-700 to-green-900", emoji: "🥥" },
  { title: "Kollywood Kuthu & Melody", query: "Tamil", color: "from-red-600 to-orange-700", emoji: "✨" },
  { title: "Punjabi Trap & Pop", query: "Punjabi", color: "from-pink-600 to-rose-700", emoji: "👳" },
  { title: "Lo-Fi Beats & Relax", query: "Lo-Fi Chill Beats", color: "from-indigo-600 to-purple-800", emoji: "🌙" },
  { title: "Phonk & Night Drive", query: "Phonk Drift", color: "from-zinc-700 to-neutral-900", emoji: "🏎️" },
  { title: "K-Pop ON! Worldwide", query: "K-Pop BTS Blackpink", color: "from-fuchsia-600 to-pink-700", emoji: "🇰🇷" },
  { title: "Latin Fiesta & Reggaeton", query: "Latin Reggaeton", color: "from-amber-600 to-orange-800", emoji: "💃" },
  { title: "Hip Hop & Rap Classics", query: "Hip Hop Rap", color: "from-slate-700 to-zinc-900", emoji: "🎧" },
  { title: "EDM Festival Club Mix", query: "EDM Club Party Dance", color: "from-cyan-600 to-blue-800", emoji: "⚡" },
  { title: "Rock & Heavy Power", query: "Rock Legends", color: "from-rose-800 to-red-950", emoji: "🎸" },
  { title: "Romantic Melodies", query: "Romantic Love Songs", color: "from-rose-600 to-red-800", emoji: "❤️" },
  { title: "All-Time Classics 80s 90s", query: "80s 90s Golden Hits", color: "from-amber-700 to-yellow-800", emoji: "⭐" },
  { title: "Workout & Gym Motivation", query: "Workout Motivation Beast", color: "from-orange-700 to-red-900", emoji: "💪" },
  { title: "Anime & Gaming Soundtracks", query: "Anime Gaming OST", color: "from-purple-700 to-indigo-900", emoji: "🎮" },
  { title: "Acoustic & Unplugged", query: "Acoustic Unplugged Coffee", color: "from-stone-600 to-amber-900", emoji: "🌾" }
];

const LANGUAGES = [
  { label: "Kannada", emoji: "🟡" },
  { label: "Hindi", emoji: "🇮🇳" },
  { label: "Konkani", emoji: "🌴" },
  { label: "Telugu", emoji: "🕺" },
  { label: "Malayalam", emoji: "🥥" },
  { label: "Tamil", emoji: "✨" },
  { label: "Punjabi", emoji: "👳" },
  { label: "English", emoji: "🇺🇸" }
];

function SpotifyIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.503 17.308c-.215.353-.674.464-1.027.249-2.812-1.718-6.353-2.107-10.523-1.155-.403.092-.803-.16-.895-.563-.092-.403.16-.803.563-.895 4.571-1.044 8.487-.601 11.633 1.337.353.215.464.674.249 1.027zm1.468-3.264c-.27.44-.847.579-1.287.31-3.218-1.977-8.125-2.55-11.933-1.393-.496.15-1.024-.134-1.174-.63-.15-.496.134-1.024.63-1.174 4.354-1.321 9.775-.681 13.454 1.58.44.27.579.847.31 1.287zm.127-3.397C15.244 8.354 8.903 8.14 5.234 9.254c-.59.18-1.218-.158-1.398-.748-.18-.59.158-1.218.748-1.398 4.225-1.283 11.233-1.036 15.688 1.608.53.315.705 1.004.39 1.534-.315.53-1.004.705-1.534.39z"/>
    </svg>
  );
}

export default function App() {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastMood, setLastMood] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState(null);
  const [selectedSidebarId, setSelectedSidebarId] = useState("kannada");
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileUrl, setMobileUrl] = useState("http://192.168.1.105:5173");
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState("home"); // "home" | "search" | "library"
  const [isListening, setIsListening] = useState(false);

  // User Custom Playlists State
  const [userPlaylists, setUserPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem(PLAYLISTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistTitle, setNewPlaylistTitle] = useState("");
  const [newPlaylistDesc, setNewPlaylistDesc] = useState("");

  // Spotify Account Connection & Import State
  const [spotifyUser, setSpotifyUser] = useState(() => {
    try {
      const saved = localStorage.getItem("aurabeat_spotify_user");
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const [spotifyImportUrl, setSpotifyImportUrl] = useState("");
  const [importingSpotify, setImportingSpotify] = useState(false);
  const [spotifyImportError, setSpotifyImportError] = useState(null);

  // Parse Spotify OAuth callback on load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("spotify_connected=")) {
      try {
        const payloadStr = decodeURIComponent(hash.split("spotify_connected=")[1]);
        const data = JSON.parse(payloadStr);
        if (data.profile) {
          setSpotifyUser(data.profile);
          localStorage.setItem("aurabeat_spotify_user", JSON.stringify(data.profile));
        }
        if (data.playlists && data.playlists.length > 0) {
          setUserPlaylists(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newOnes = data.playlists.filter(p => !existingIds.has(p.id));
            const combined = [...newOnes, ...prev];
            try { localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(combined)); } catch (e) {}
            return combined;
          });
        }
        window.history.replaceState(null, '', window.location.pathname);
        setActiveTab("library");
      } catch (err) {}
    }
  }, []);

  const handleImportSpotifyPlaylist = async (e) => {
    e?.preventDefault();
    if (!spotifyImportUrl.trim() || importingSpotify) return;

    setImportingSpotify(true);
    setSpotifyImportError(null);

    try {
      const res = await fetch("/api/spotify/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: spotifyImportUrl.trim() })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to import Spotify playlist.");
      }

      const data = await res.json();
      if (data.playlist) {
        const updated = [data.playlist, ...userPlaylists.filter(p => p.id !== data.playlist.id)];
        saveUserPlaylists(updated);
        setSpotifyImportUrl("");
        setShowSpotifyModal(false);
        handleSelectCustomPlaylist(data.playlist);
      }
    } catch (err) {
      setSpotifyImportError(err.message || "Could not import playlist. Check the URL and try again.");
    } finally {
      setImportingSpotify(false);
    }
  };

  const handleDisconnectSpotify = () => {
    setSpotifyUser(null);
    localStorage.removeItem("aurabeat_spotify_user");
    setShowSpotifyModal(false);
  };

  // Universal Live Search State
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounced Universal Search across YouTube, Spotify & 100M+ global catalog
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      setShowSearchDropdown(false);
      return;
    }

    setSearching(true);
    setShowSearchDropdown(true);

    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.results || []);
        })
        .catch(() => {})
        .finally(() => setSearching(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener to dismiss live search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSearchResultSong = (track) => {
    const others = searchResults.filter(t => (t.title || '').toLowerCase() !== (track.title || '').toLowerCase());
    setPlaylist({
      mood: track.title,
      vibeTitle: track.title,
      vibeDescription: `Worldwide track by ${track.artist} • 100% Free & Ad-Free`,
      emoji: "🎵✨",
      genre: "Worldwide Master Stream",
      energy: "98% High Energy",
      colorTheme: ["#1ed760", "#121212"],
      spotifyUrl: track.spotifyUrl || `https://open.spotify.com/search/${encodeURIComponent(track.title + ' ' + track.artist)}`,
      tracks: [track, ...others]
    });
    setShowSearchDropdown(false);
    setActiveTab("home");
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {}

    fetch("/api/network-info")
      .then(res => res.json())
      .then(data => {
        if (data.mobileUrl) setMobileUrl(data.mobileUrl);
      })
      .catch(() => {});

    // Initial default load
    handleMoodSubmit("Kannada", false);
  }, []);

  const saveToHistory = (moodText) => {
    try {
      const updated = [moodText, ...history.filter(m => m.toLowerCase() !== moodText.toLowerCase())].slice(0, 8);
      setHistory(updated);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const saveUserPlaylists = (updated) => {
    setUserPlaylists(updated);
    try {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCreatePlaylist = (e) => {
    e?.preventDefault();
    const title = newPlaylistTitle.trim() || `My Playlist #${userPlaylists.length + 1}`;
    const newPl = {
      id: `custom_${Date.now()}`,
      title,
      description: newPlaylistDesc.trim() || "Created on AuraBeat Spotify",
      emoji: "🎵",
      color: "from-emerald-600 to-slate-900",
      tracks: []
    };
    const updated = [newPl, ...userPlaylists];
    saveUserPlaylists(updated);
    setNewPlaylistTitle("");
    setNewPlaylistDesc("");
    setShowCreatePlaylistModal(false);
    handleSelectCustomPlaylist(newPl);
  };

  const handleSelectCustomPlaylist = (customPl) => {
    setSelectedSidebarId(customPl.id);
    setActiveTab("home");
    setPlaylist({
      mood: customPl.title,
      vibeTitle: customPl.title,
      vibeDescription: customPl.description || "Your custom Spotify playlist",
      emoji: customPl.emoji || "🎵",
      genre: "Custom Playlist",
      energy: "Personal Mix",
      colorTheme: ["#1ed760", "#121212"],
      spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(customPl.title)}`,
      tracks: customPl.tracks || []
    });
  };

  const handleAddTrackToPlaylist = (playlistId, track) => {
    let targetTitle = "Playlist";
    const updated = userPlaylists.map(pl => {
      if (pl.id === playlistId) {
        targetTitle = pl.title;
        const exists = pl.tracks.some(t => t.title.toLowerCase() === track.title.toLowerCase());
        if (exists) return pl;
        return { ...pl, tracks: [track, ...pl.tracks] };
      }
      return pl;
    });
    saveUserPlaylists(updated);
    if (selectedSidebarId === playlistId) {
      setPlaylist(prev => prev ? { ...prev, tracks: [track, ...(prev.tracks || []).filter(t => t.title.toLowerCase() !== track.title.toLowerCase())] } : prev);
    }
  };

  const handleMoodSubmit = async (mood, shouldSaveHistory = true) => {
    setLoading(true);
    setError(null);
    setLastMood(mood);
    setActiveTab("home");

    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch playlist");
      }

      const data = await response.json();
      setPlaylist(data);
      if (shouldSaveHistory) {
        saveToHistory(mood);
      }
    } catch (e) {
      setError(e.message || "Could not generate playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim() || loading) return;
    const finalQuery = selectedLang && !searchQuery.toLowerCase().includes(selectedLang.toLowerCase())
      ? `${searchQuery.trim()} in ${selectedLang}`
      : searchQuery.trim();
    handleMoodSubmit(finalQuery);
  };

  const handleLanguageSelect = (langLabel) => {
    if (selectedLang === langLabel) {
      setSelectedLang(null);
      handleMoodSubmit("Top Hits");
    } else {
      setSelectedLang(langLabel);
      setSearchQuery("");
      handleMoodSubmit(langLabel);
    }
  };

  const handleVoiceSearch = () => {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please type your query.");
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognizer = new SpeechRecognition();
      recognizer.lang = "en-US";
      recognizer.interimResults = false;

      recognizer.onstart = () => setIsListening(true);
      recognizer.onend = () => setIsListening(false);
      recognizer.onerror = () => setIsListening(false);

      recognizer.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        if (transcript.trim()) {
          handleMoodSubmit(transcript.trim());
        }
      };

      recognizer.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleCopyMobileUrl = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans selection:bg-[#1ed760] selection:text-black">
      {/* Create Playlist Modal */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#282828] border border-[#3e3e3e] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#3e3e3e]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#1ed760]" />
                <span>Create New Playlist</span>
              </h3>
              <button onClick={() => setShowCreatePlaylistModal(false)} className="text-[#b3b3b3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlaylist} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#b3b3b3]">Playlist Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newPlaylistTitle}
                  onChange={(e) => setNewPlaylistTitle(e.target.value)}
                  placeholder={`My Playlist #${userPlaylists.length + 1}`}
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-[#3e3e3e] rounded-lg text-sm text-white focus:outline-none focus:border-[#1ed760]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#b3b3b3]">Description (optional)</label>
                <input
                  type="text"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  placeholder="Give your playlist a vibe description..."
                  className="w-full mt-1 px-3 py-2 bg-[#181818] border border-[#3e3e3e] rounded-lg text-sm text-white focus:outline-none focus:border-[#1ed760]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#b3b3b3] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full text-xs font-bold bg-[#1ed760] text-black hover:scale-105 transition-all shadow-md"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Spotify Account & Import Playlist Modal */}
      {showSpotifyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-[#282828] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg shadow-[#1ed760]/20">
                  <SpotifyIcon className="w-4 h-4 fill-black" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Spotify Account & Playlists</h3>
                  <p className="text-[11px] text-[#b3b3b3]">Connect your account or import any playlist</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSpotifyModal(false)} 
                className="p-1.5 text-[#b3b3b3] hover:text-white bg-[#242424] hover:bg-[#2e2e2e] rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Spotify Account Status Section */}
            <div className="p-4 bg-[#242424] rounded-2xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Account Sync</span>
                {spotifyUser ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1ed760]/20 text-[#1ed760] font-bold border border-[#1ed760]/30 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#b3b3b3] font-bold">
                    Not Linked
                  </span>
                )}
              </div>

              {spotifyUser ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {spotifyUser.images?.[0]?.url ? (
                      <img src={spotifyUser.images[0].url} alt={spotifyUser.display_name} className="w-12 h-12 rounded-full object-cover border border-[#1ed760]" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1ed760] text-black font-extrabold text-base flex items-center justify-center">
                        {spotifyUser.display_name?.[0]?.toUpperCase() || "S"}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">{spotifyUser.display_name || "Spotify User"}</p>
                      <p className="text-xs text-[#b3b3b3] truncate">
                        {spotifyUser.email || (spotifyUser.followers?.total ? `${spotifyUser.followers.total} followers` : "Spotify Account")} • {spotifyUser.product ? `${spotifyUser.product.toUpperCase()}` : "User"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-[#1ed760]">✓ Your Spotify playlists are auto-synced into AuraBeat</p>
                    <button
                      onClick={handleDisconnectSpotify}
                      className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg text-xs font-bold transition-all"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-[#b3b3b3] leading-relaxed">
                    Log in with your official Spotify account to instantly load all your personal Spotify playlists into AuraBeat for unlimited free playback.
                  </p>
                  <button
                    onClick={() => { window.location.href = '/api/spotify/login'; }}
                    className="w-full py-2.5 px-4 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold rounded-full text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <SpotifyIcon className="w-4 h-4 fill-black" />
                    <span>Connect Official Spotify Account</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Spotify Playlist URL Importer Section */}
            <div className="p-4 bg-[#242424] rounded-2xl border border-white/5 space-y-3">
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider">Import Any Spotify Playlist</span>
                <p className="text-[11px] text-[#b3b3b3] mt-0.5">
                  Paste any public Spotify playlist URL or Spotify URI link below
                </p>
              </div>

              <form onSubmit={handleImportSpotifyPlaylist} className="space-y-3">
                <input
                  type="text"
                  value={spotifyImportUrl}
                  onChange={(e) => setSpotifyImportUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#3e3e3e] focus:border-[#1ed760] rounded-xl text-xs text-white placeholder-[#757575] focus:outline-none transition-all"
                />

                {spotifyImportError && (
                  <p className="text-xs text-red-400 bg-red-950/50 p-2 rounded-lg border border-red-900/50">
                    {spotifyImportError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={importingSpotify || !spotifyImportUrl.trim()}
                  className="w-full py-2.5 px-4 bg-white hover:bg-white/90 disabled:opacity-50 text-black font-extrabold rounded-full text-xs flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-95 transition-all"
                >
                  {importingSpotify ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Importing Spotify Tracks & Artwork...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-black stroke-[3]" />
                      <span>Import Playlist to Library</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="text-[11px] text-[#b3b3b3] text-center">
              All songs play 100% free with continuous background playback on lock-screen and minimized laptops.
            </div>
          </div>
        </div>
      )}

      {/* Mobile QR Modal */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-[#282828] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center relative">
            <button
              onClick={() => setShowMobileModal(false)}
              className="absolute top-4 right-4 p-2 text-[#b3b3b3] hover:text-white bg-[#282828] rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#1ed760]/20 text-[#1ed760] flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Open on Your Phone 📱</h3>
              <p className="text-xs text-[#b3b3b3] mt-1">
                Make sure your phone is connected to the <b>same Wi-Fi</b> network!
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-inner">
              <QRCodeSVG value={mobileUrl} size={170} level="M" />
            </div>

            <div className="flex items-center gap-2 bg-[#121212] p-2.5 rounded-xl border border-[#282828] text-left">
              <span className="text-xs text-[#1ed760] font-mono flex-1 truncate">{mobileUrl}</span>
              <button
                onClick={handleCopyMobileUrl}
                className="p-1.5 bg-[#282828] hover:bg-[#333333] text-white rounded-lg text-xs flex items-center gap-1"
                title="Copy URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#1ed760]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-[#b3b3b3]">
              Plays smoothly in background even when your phone screen is off!
            </p>
          </div>
        </div>
      )}

      {/* Main Spotify Shell Layout (Left Sidebar + Center Viewport) */}
      <div className="flex-1 flex gap-2 p-2 min-h-0 overflow-hidden">
        {/* Left Spotify Navigation & Library Sidebar (Desktop) */}
        <aside className="w-64 sm:w-72 lg:w-80 bg-[#121212] rounded-xl flex flex-col p-3 gap-3 flex-shrink-0 hidden md:flex border border-[#282828]/50">
          {/* Top Spotify Brand & Navigation Card */}
          <div className="bg-[#181818]/70 rounded-xl p-3 space-y-3">
            {/* Spotify Brand Logo */}
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="w-8 h-8 rounded-full bg-[#1ed760] flex items-center justify-center text-black shadow-lg shadow-[#1ed760]/30 flex-shrink-0">
                <Headphones className="w-4 h-4 fill-current stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold text-white tracking-tight">Spotify</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#1ed760]/20 text-[#1ed760] font-bold uppercase tracking-wider">
                    VIP
                  </span>
                </div>
                <div className="text-[10px] text-[#b3b3b3] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#1ed760]" />
                  <span>100% Free • All Songs</span>
                </div>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1 pt-1">
              <button
                onClick={() => {
                  setActiveTab("home");
                  handleMoodSubmit("Trending Top Hits");
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === "home" ? "text-white bg-[#282828]" : "text-[#b3b3b3] hover:text-white hover:bg-[#282828]/50"
                }`}
              >
                <Home className="w-4 h-4 text-[#1ed760]" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("search");
                  const searchInput = document.getElementById("spotify-search-input");
                  if (searchInput) searchInput.focus();
                }}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === "search" ? "text-white bg-[#282828]" : "text-[#b3b3b3] hover:text-white hover:bg-[#282828]/50"
                }`}
              >
                <Search className="w-4 h-4 text-[#b3b3b3]" />
                <span>Search Any Song</span>
              </button>

              <button
                onClick={() => setActiveTab("library")}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                  activeTab === "library" ? "text-white bg-[#282828]" : "text-[#b3b3b3] hover:text-white hover:bg-[#282828]/50"
                }`}
              >
                <Library className="w-4 h-4 text-[#1ed760]" />
                <span>Your Library</span>
              </button>
            </nav>
          </div>

          {/* "Your Library" Card */}
          <div className="flex-1 bg-[#181818]/50 rounded-xl p-3 flex flex-col min-h-0 overflow-hidden border border-[#282828]/30">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#282828]/60">
              <div 
                onClick={() => setActiveTab("library")}
                className="flex items-center gap-2 text-xs font-bold text-[#b3b3b3] hover:text-white transition-colors cursor-pointer"
              >
                <Library className="w-4 h-4 text-[#1ed760]" />
                <span>Playlists</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSpotifyModal(true)}
                  className="p-1.5 text-[#1ed760] hover:text-white hover:bg-[#282828] rounded-lg transition-all flex items-center gap-1 text-[11px] font-bold"
                  title="Connect Spotify Account or Import Playlist"
                >
                  <SpotifyIcon className="w-3.5 h-3.5 fill-[#1ed760]" />
                  <span>Spotify</span>
                </button>
                <button
                  onClick={() => setShowCreatePlaylistModal(true)}
                  className="p-1.5 text-[#b3b3b3] hover:text-white hover:bg-[#282828] rounded-lg transition-all flex items-center gap-1 text-[11px] font-bold"
                  title="Create New Playlist"
                >
                  <Plus className="w-4 h-4 text-[#1ed760]" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Scrollable Playlists List */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {/* Liked Songs Playlist Item */}
              <div
                onClick={() => {
                  setSelectedSidebarId("liked");
                  const likedBtn = document.getElementById("spotify-liked-filter-btn");
                  if (likedBtn) likedBtn.click();
                }}
                className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all ${
                  selectedSidebarId === "liked" ? "bg-[#282828]" : "hover:bg-[#282828]/60"
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">Liked Songs</div>
                  <div className="text-[11px] text-[#b3b3b3] flex items-center gap-1 truncate">
                    <span className="text-[#1ed760]">📌 Pinned</span> • Auto-saved
                  </div>
                </div>
              </div>

              {/* User Custom Created Playlists */}
              {userPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => handleSelectCustomPlaylist(pl)}
                  className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all group ${
                    selectedSidebarId === pl.id ? "bg-[#282828] border-l-4 border-[#1ed760]" : "hover:bg-[#282828]/60"
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md">
                    {pl.emoji || "🎵"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-bold truncate ${selectedSidebarId === pl.id ? "text-[#1ed760]" : "text-white group-hover:text-[#1ed760]"}`}>
                      {pl.title}
                    </div>
                    <div className="text-[11px] text-[#b3b3b3] truncate">
                      Playlist • {pl.tracks?.length || 0} songs
                    </div>
                  </div>
                </div>
              ))}

              {/* 8 Regional Curated Playlists */}
              {SPOTIFY_PLAYLISTS.map((pl) => {
                const isSelected = selectedSidebarId === pl.id || (lastMood.toLowerCase().includes(pl.query.toLowerCase()));
                return (
                  <div
                    key={pl.id}
                    onClick={() => {
                      setSelectedSidebarId(pl.id);
                      setSelectedLang(pl.query);
                      handleMoodSubmit(pl.query);
                    }}
                    className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all group ${
                      isSelected ? "bg-[#282828] border-l-4 border-[#1ed760]" : "hover:bg-[#282828]/60"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pl.color} flex items-center justify-center text-lg flex-shrink-0 shadow-md font-bold`}>
                      {pl.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-bold truncate ${isSelected ? "text-[#1ed760]" : "text-white group-hover:text-[#1ed760]"}`}>
                        {pl.title}
                      </div>
                      <div className="text-[11px] text-[#b3b3b3] truncate">
                        {pl.desc} • {pl.count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Central Main Viewport */}
        <main className="flex-1 bg-[#121212] rounded-xl flex flex-col min-h-0 overflow-hidden relative border border-[#282828]/50">
          {/* Top Sticky Spotify Navigation Header Bar */}
          <header className="h-16 px-4 sm:px-6 flex items-center justify-between z-30 bg-[#121212]/95 backdrop-blur-md border-b border-[#282828]/60 flex-shrink-0 gap-3">
            {/* Left: Back / Forward history arrows */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button 
                onClick={() => window.history.back()} 
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-[#b3b3b3] hover:text-white flex items-center justify-center transition-all"
                title="Go Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={() => window.history.forward()} 
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-[#b3b3b3] hover:text-white flex items-center justify-center transition-all hidden sm:flex"
                title="Go Forward"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Center: Spotify Pill Search Bar (Searches literally all songs on YouTube, Spotify & Worldwide) */}
            <div ref={searchContainerRef} className="flex-1 max-w-md relative">
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 pointer-events-none" />
                <input
                  id="spotify-search-input"
                  type="text"
                  value={searchQuery}
                  onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true); }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Play any song in YouTube or Spotify worldwide..."
                  className="w-full pl-10 pr-20 py-2 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] border border-transparent focus:border-white/20 rounded-full text-xs sm:text-sm text-white placeholder-[#757575] focus:outline-none transition-all"
                />
                
                {/* Voice Mic & Clear Buttons */}
                <div className="absolute right-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(""); setSearchResults([]); setShowSearchDropdown(false); }}
                      className="p-1 text-[#b3b3b3] hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`p-1.5 rounded-full transition-all ${isListening ? "bg-rose-500 text-white animate-pulse" : "text-[#b3b3b3] hover:text-white hover:bg-[#333333]"}`}
                    title="Search by Voice"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Floating Instant Universal Search Results Dropdown */}
              {showSearchDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#282828] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto scrollbar-thin animate-in fade-in duration-150">
                  {searching ? (
                    <div className="py-4 text-center text-xs text-[#b3b3b3] flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#1ed760]" />
                      <span>Searching all songs on YouTube & Spotify worldwide...</span>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="py-3 text-center text-xs text-[#b3b3b3]">
                      Press Enter to search live on YouTube and Spotify
                    </div>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#b3b3b3] flex items-center justify-between">
                        <span>Worldwide Instant Results</span>
                        <span className="text-[#1ed760] font-mono">{searchResults.length} songs</span>
                      </div>
                      <div className="space-y-1">
                        {searchResults.slice(0, 7).map((track, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectSearchResultSong(track)}
                            className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-[#383838] cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <img 
                                src={track.artworkUrl || (track.youtubeVideoId ? `https://i.ytimg.com/vi/${track.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100`)} 
                                alt={track.title}
                                className="w-10 h-10 rounded object-cover flex-shrink-0 bg-[#181818]"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate group-hover:text-[#1ed760]">{track.title}</p>
                                <p className="text-[11px] text-[#b3b3b3] truncate">{track.artist}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-[10px] font-mono text-[#b3b3b3]">{track.duration}</span>
                              <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div 
                        onClick={handleSearchSubmit}
                        className="mt-2 pt-2 border-t border-white/10 px-3 py-1.5 text-center text-xs text-[#1ed760] hover:underline cursor-pointer font-bold flex items-center justify-center gap-1.5"
                      >
                        <span>Open full worldwide playlist for "{searchQuery}"</span>
                        <span>→</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right: Language Quick Filter Chips + Phone Connect */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Quick Language Chips */}
              <div className="hidden xl:flex items-center gap-1">
                {LANGUAGES.slice(0, 5).map((l, i) => (
                  <button
                    key={i}
                    onClick={() => handleLanguageSelect(l.label)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                      selectedLang === l.label
                        ? "bg-[#1ed760] text-black shadow-md shadow-[#1ed760]/20"
                        : "bg-[#242424] text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a]"
                    }`}
                  >
                    <span>{l.emoji} {l.label}</span>
                  </button>
                ))}
              </div>

              {/* Mobile QR Button */}
              <button
                onClick={() => setShowMobileModal(true)}
                className="px-3 py-1.5 bg-[#242424] hover:bg-[#2a2a2a] rounded-full text-xs font-bold text-white flex items-center gap-1.5 transition-all border border-[#333333]"
                title="Scan QR to open on your phone"
              >
                <QrCode className="w-3.5 h-3.5 text-[#1ed760]" />
                <span className="hidden sm:inline">Phone App</span>
              </button>

              {/* Spotify Account Pill / Connect Button */}
              {spotifyUser ? (
                <button
                  onClick={() => setShowSpotifyModal(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#242424] hover:bg-[#2e2e2e] border border-[#1ed760]/50 rounded-full transition-all group shadow-md"
                  title={`Spotify Connected: ${spotifyUser.display_name || 'User'}`}
                >
                  {spotifyUser.images?.[0]?.url ? (
                    <img src={spotifyUser.images[0].url} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#1ed760] text-black font-bold text-[10px] flex items-center justify-center">
                      {spotifyUser.display_name?.[0]?.toUpperCase() || "S"}
                    </div>
                  )}
                  <span className="text-xs font-bold text-white truncate max-w-[80px] hidden sm:inline">
                    {spotifyUser.display_name || "Spotify"}
                  </span>
                  <SpotifyIcon className="w-3.5 h-3.5 text-[#1ed760]" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSpotifyModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black font-bold text-xs transition-all shadow-md hover:scale-105"
                  title="Connect Spotify Account or Import Playlists"
                >
                  <SpotifyIcon className="w-3.5 h-3.5 fill-black" />
                  <span className="hidden sm:inline">Connect Spotify</span>
                </button>
              )}
            </div>
          </header>

          {/* Main Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 space-y-6 scrollbar-thin">
            {/* Quick Language Switch Row for Mobile / Tablet */}
            <div className="flex xl:hidden items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="flex items-center gap-1 text-[#b3b3b3] font-bold text-xs px-1 flex-shrink-0">
                <Globe2 className="w-3.5 h-3.5 text-[#1ed760]" />
                <span>Languages:</span>
              </span>
              {LANGUAGES.map((l, i) => (
                <button
                  key={i}
                  onClick={() => handleLanguageSelect(l.label)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 flex-shrink-0 ${
                    selectedLang === l.label
                      ? "bg-[#1ed760] text-black shadow-md shadow-[#1ed760]/20"
                      : "bg-[#242424] text-[#b3b3b3] hover:text-white hover:bg-[#2a2a2a]"
                  }`}
                >
                  <span>{l.emoji}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: SEARCH / BROWSE CATEGORIES (When activeTab === "search") */}
            {activeTab === "search" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {searchQuery.trim() ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Search Results for "{searchQuery}"
                      </h2>
                      <span className="text-xs text-[#1ed760] font-mono font-bold">
                        {searchResults.length} songs found worldwide
                      </span>
                    </div>

                    {searching ? (
                      <div className="py-16 text-center text-xs text-[#b3b3b3] flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1ed760]" />
                        <span>Searching YouTube & Spotify across all worldwide songs...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-6">
                        {/* Top Result + Songs Preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                          {/* Top Result Card */}
                          <div className="lg:col-span-5 bg-[#181818] hover:bg-[#282828] p-5 rounded-2xl border border-white/5 transition-all group relative flex flex-col justify-between">
                            <div>
                              <p className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-3">Top Result</p>
                              <img 
                                src={searchResults[0].artworkUrl || (searchResults[0].youtubeVideoId ? `https://i.ytimg.com/vi/${searchResults[0].youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300`)} 
                                alt={searchResults[0].title}
                                className="w-28 h-28 rounded-xl object-cover shadow-xl bg-[#282828] mb-4"
                              />
                              <h3 className="text-2xl font-black text-white truncate group-hover:text-[#1ed760] transition-colors">
                                {searchResults[0].title}
                              </h3>
                              <p className="text-sm text-[#b3b3b3] truncate mt-1">
                                {searchResults[0].artist} • <span className="text-white/60 font-semibold uppercase text-xs">Song</span>
                              </p>
                            </div>
                            <div className="pt-4 flex items-center justify-between">
                              <span className="text-xs font-mono text-[#b3b3b3]">{searchResults[0].duration}</span>
                              <button
                                onClick={() => handleSelectSearchResultSong(searchResults[0])}
                                className="w-12 h-12 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                                title="Play Track"
                              >
                                <Play className="w-6 h-6 fill-current ml-0.5" />
                              </button>
                            </div>
                          </div>

                          {/* Top 4 Songs List */}
                          <div className="lg:col-span-7 space-y-1.5">
                            <p className="text-xs font-bold text-[#b3b3b3] uppercase tracking-wider mb-2">Songs</p>
                            {searchResults.slice(0, 4).map((track, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSelectSearchResultSong(track)}
                                className="flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-[#282828] cursor-pointer transition-colors group"
                              >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                  <img 
                                    src={track.artworkUrl || (track.youtubeVideoId ? `https://i.ytimg.com/vi/${track.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100`)} 
                                    alt={track.title}
                                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0 bg-[#282828]"
                                  />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-white truncate group-hover:text-[#1ed760]">{track.title}</p>
                                    <p className="text-xs text-[#b3b3b3] truncate">{track.artist}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="text-xs font-mono text-[#b3b3b3]">{track.duration}</span>
                                  <div className="w-8 h-8 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* All Matching Tracks Grid */}
                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <h3 className="text-base font-bold text-white">All Matching Tracks ({searchResults.length})</h3>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                            {searchResults.map((track, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSelectSearchResultSong(track)}
                                className="p-3 bg-[#181818] hover:bg-[#282828] rounded-xl cursor-pointer transition-all flex flex-col justify-between group border border-transparent hover:border-white/10"
                              >
                                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-2.5 bg-[#282828]">
                                  <img 
                                    src={track.artworkUrl || (track.youtubeVideoId ? `https://i.ytimg.com/vi/${track.youtubeVideoId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200`)} 
                                    alt={track.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-[#1ed760] text-black flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200">
                                    <Play className="w-4 h-4 fill-current ml-0.5" />
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate group-hover:text-[#1ed760]">{track.title}</p>
                                  <p className="text-[11px] text-[#b3b3b3] truncate mt-0.5">{track.artist}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-16 text-center text-sm text-[#b3b3b3] space-y-3">
                        <p>No instant results found. Press Enter to search YouTube and Spotify worldwide!</p>
                        <button
                          onClick={handleSearchSubmit}
                          className="px-5 py-2 bg-[#1ed760] text-black rounded-full font-bold text-xs"
                        >
                          Search Universal Catalog for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h2 className="text-xl sm:text-2xl font-black text-white">Browse All Music in the World</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {SPOTIFY_BROWSE_TILES.map((tile, i) => (
                        <div
                          key={i}
                          onClick={() => handleMoodSubmit(tile.query)}
                          className={`relative h-28 sm:h-36 rounded-2xl p-4 bg-gradient-to-br ${tile.color} cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-lg overflow-hidden flex flex-col justify-between group`}
                        >
                          <h3 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                            {tile.title}
                          </h3>
                          <span className="text-3xl sm:text-4xl self-end transform group-hover:rotate-12 group-hover:scale-110 transition-transform">
                            {tile.emoji}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: YOUR LIBRARY VIEW (When activeTab === "library") */}
            {activeTab === "library" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-white">Your Music Library</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSpotifyModal(true)}
                      className="px-4 py-2 bg-[#242424] hover:bg-[#2e2e2e] border border-[#1ed760]/50 text-[#1ed760] rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
                    >
                      <SpotifyIcon className="w-3.5 h-3.5 fill-[#1ed760]" />
                      <span>{spotifyUser ? "Spotify Connected" : "Import / Connect Spotify"}</span>
                    </button>
                    <button
                      onClick={() => setShowCreatePlaylistModal(true)}
                      className="px-4 py-2 bg-[#1ed760] text-black rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create Playlist</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Liked Songs Big Card */}
                  <div
                    onClick={() => {
                      setActiveTab("home");
                      const likedBtn = document.getElementById("spotify-liked-filter-btn");
                      if (likedBtn) likedBtn.click();
                    }}
                    className="col-span-2 p-5 rounded-2xl bg-gradient-to-br from-[#450af5] to-[#8e8ee5] text-white flex flex-col justify-end cursor-pointer hover:scale-[1.01] transition-transform shadow-xl min-h-[140px]"
                  >
                    <Heart className="w-8 h-8 fill-white mb-2" />
                    <h3 className="text-lg font-black">Liked Songs</h3>
                    <p className="text-xs text-white/80">Auto-saved favorite songs</p>
                  </div>

                  {/* User Created Playlists */}
                  {userPlaylists.map((pl) => (
                    <div
                      key={pl.id}
                      onClick={() => handleSelectCustomPlaylist(pl)}
                      className="p-4 rounded-2xl bg-[#181818] hover:bg-[#282828] border border-[#282828] cursor-pointer transition-all flex flex-col justify-between group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-xl mb-3 shadow-md">
                        {pl.emoji || "🎵"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-[#1ed760]">
                          {pl.title}
                        </h4>
                        <p className="text-xs text-[#b3b3b3] truncate mt-0.5">
                          {pl.tracks?.length || 0} songs
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: HOME / ACTIVE PLAYLIST VIEW */}
            {activeTab === "home" && (
              <>
                {/* Loading State */}
                {loading && (
                  <div className="w-full py-20 flex flex-col items-center justify-center space-y-4 bg-[#181818]/60 rounded-3xl border border-[#282828]">
                    <div className="w-12 h-12 rounded-full border-4 border-[#1ed760]/20 border-t-[#1ed760] animate-spin" />
                    <div className="text-center space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-white">Loading Spotify Master Playlist…</h3>
                      <p className="text-xs text-[#b3b3b3]">Curating top blockbuster songs with full synchronized lyrics...</p>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && !loading && (
                  <div className="w-full p-4 bg-rose-950/60 border border-rose-800 rounded-2xl flex items-center justify-between gap-4 text-rose-300 text-xs sm:text-sm">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                    {lastMood && (
                      <button
                        onClick={() => handleMoodSubmit(lastMood)}
                        className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Player Component */}
                {playlist && !loading && (
                  <Player 
                    playlist={playlist} 
                    userPlaylists={userPlaylists}
                    onRefreshPlaylist={handleMoodSubmit}
                    onSelectLanguage={handleLanguageSelect}
                    onAddTrackToPlaylist={handleAddTrackToPlaylist}
                    onCreatePlaylist={() => setShowCreatePlaylistModal(true)}
                  />
                )}
              </>
            )}
          </div>

          {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
          <nav className="md:hidden h-16 bg-[#121212]/95 backdrop-blur-lg border-t border-[#282828] flex items-center justify-around z-30 flex-shrink-0 px-2">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center gap-1 ${activeTab === "home" ? "text-[#1ed760]" : "text-[#b3b3b3]"}`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold">Home</span>
            </button>
            <button
              onClick={() => {
                setActiveTab("search");
                const searchInput = document.getElementById("spotify-search-input");
                if (searchInput) searchInput.focus();
              }}
              className={`flex flex-col items-center gap-1 ${activeTab === "search" ? "text-[#1ed760]" : "text-[#b3b3b3]"}`}
            >
              <Search className="w-5 h-5" />
              <span className="text-[10px] font-bold">Search</span>
            </button>
            <button
              onClick={() => setActiveTab("library")}
              className={`flex flex-col items-center gap-1 ${activeTab === "library" ? "text-[#1ed760]" : "text-[#b3b3b3]"}`}
            >
              <Library className="w-5 h-5" />
              <span className="text-[10px] font-bold">Your Library</span>
            </button>
            <button
              onClick={() => setShowMobileModal(true)}
              className="flex flex-col items-center gap-1 text-[#b3b3b3]"
            >
              <QrCode className="w-5 h-5 text-[#1ed760]" />
              <span className="text-[10px] font-bold">Phone App</span>
            </button>
          </nav>
        </main>
      </div>
    </div>
  );
}
