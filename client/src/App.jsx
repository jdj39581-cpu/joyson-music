// src/App.jsx
import React, { useState, useEffect } from "react";
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
  Play
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
  { title: "Today's Top Hits", query: "Top Hits", color: "from-emerald-600 to-teal-800", emoji: "🔥" },
  { title: "Kannada Mass", query: "Kannada", color: "from-amber-600 to-red-700", emoji: "🟡" },
  { title: "Bollywood Butter", query: "Hindi", color: "from-orange-600 to-rose-700", emoji: "🇮🇳" },
  { title: "Konkani Baila", query: "Konkani", color: "from-teal-600 to-cyan-800", emoji: "🌴" },
  { title: "Tollywood Mass", query: "Telugu", color: "from-purple-600 to-pink-700", emoji: "🕺" },
  { title: "Mollywood Beats", query: "Malayalam", color: "from-emerald-700 to-green-900", emoji: "🥥" },
  { title: "Kollywood Kuthu", query: "Tamil", color: "from-red-600 to-orange-700", emoji: "✨" },
  { title: "Punjabi 101", query: "Punjabi", color: "from-pink-600 to-rose-700", emoji: "👳" },
  { title: "Global Top 50", query: "English", color: "from-blue-600 to-indigo-800", emoji: "🇺🇸" },
  { title: "Lo-Fi Beats & Chill", query: "Lo-Fi Chill", color: "from-indigo-600 to-purple-800", emoji: "🌙" },
  { title: "Party DJ Bangers", query: "Party DJ", color: "from-fuchsia-600 to-purple-800", emoji: "⚡" },
  { title: "Romantic Melodies", query: "Romantic Love", color: "from-rose-600 to-red-800", emoji: "❤️" },
  { title: "All-Time Classics", query: "Classics", color: "from-amber-700 to-yellow-800", emoji: "⭐" },
  { title: "Workout Hype", query: "Workout Motivation", color: "from-orange-700 to-red-900", emoji: "💪" }
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
              <button
                onClick={() => setShowCreatePlaylistModal(true)}
                className="p-1.5 text-[#b3b3b3] hover:text-white hover:bg-[#282828] rounded-lg transition-all flex items-center gap-1 text-[11px] font-bold"
                title="Create New Playlist"
              >
                <Plus className="w-4 h-4 text-[#1ed760]" />
                <span>New</span>
              </button>
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

            {/* Center: Spotify Pill Search Bar (Searches all 100M+ songs) */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative flex items-center">
              <div className="relative w-full flex items-center">
                <Search className="w-4 h-4 text-[#b3b3b3] absolute left-3.5 pointer-events-none" />
                <input
                  id="spotify-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to play? (Any song, artist, album, mood)..."
                  className="w-full pl-10 pr-20 py-2 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] border border-transparent focus:border-white/20 rounded-full text-xs sm:text-sm text-white placeholder-[#757575] focus:outline-none transition-all"
                />
                
                {/* Voice Mic & Clear Buttons */}
                <div className="absolute right-2 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
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
              </div>
            </form>

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

              {/* User Avatar */}
              <div 
                className="w-8 h-8 rounded-full bg-[#1ed760]/20 border border-[#1ed760]/40 text-[#1ed760] font-bold text-xs flex items-center justify-center shadow-md cursor-pointer hover:scale-105 transition-transform"
                title="AuraBeat Spotify VIP User"
              >
                VIP
              </div>
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
              <div className="space-y-4 animate-in fade-in duration-200">
                <h2 className="text-xl sm:text-2xl font-black text-white">Browse All Spotify Categories</h2>
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

            {/* TAB 2: YOUR LIBRARY VIEW (When activeTab === "library") */}
            {activeTab === "library" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl sm:text-2xl font-black text-white">Your Music Library</h2>
                  <button
                    onClick={() => setShowCreatePlaylistModal(true)}
                    className="px-4 py-2 bg-[#1ed760] text-black rounded-full font-bold text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Playlist</span>
                  </button>
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
