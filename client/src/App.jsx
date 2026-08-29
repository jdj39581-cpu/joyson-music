// src/App.jsx
import React, { useState, useEffect } from "react";
import MoodInput from "./components/MoodInput.jsx";
import Player from "./components/Player.jsx";
import { Headphones, Sparkles, History, AlertCircle, RefreshCw, Smartphone, QrCode, X, Copy, Check, ShieldCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const HISTORY_KEY = "aurabeat_mood_history";

// Trending moods to auto-refresh on initial visit
const AUTO_REFRESH_MOODS = [
  "Trending Top Hits",
  "Kannada Superhits",
  "Bollywood Party Hits",
  "Konkani Coastal Classics",
  "English Billboard Pop Hits"
];

export default function App() {
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [lastMood, setLastMood] = useState("");
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileUrl, setMobileUrl] = useState(`http://192.168.1.105:5173`);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Load history, fetch local network IP, and auto-refresh songs on page visit!
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not read mood history:", e);
    }

    // Fetch local network IP from server
    fetch("/api/network-info")
      .then(res => res.json())
      .then(data => {
        if (data.mobileUrl) {
          setMobileUrl(data.mobileUrl);
        }
      })
      .catch(() => {});

    // Automatically load fresh songs on website visit
    const randomInitialMood = AUTO_REFRESH_MOODS[Math.floor(Math.random() * AUTO_REFRESH_MOODS.length)];
    handleMoodSubmit(randomInitialMood, false);
  }, []);

  const saveToHistory = (moodText) => {
    try {
      const updated = [moodText, ...history.filter(m => m.toLowerCase() !== moodText.toLowerCase())].slice(0, 6);
      setHistory(updated);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save mood history:", e);
    }
  };

  const handleMoodSubmit = async (mood, shouldSaveHistory = true) => {
    setLoading(true);
    setError(null);
    setLastMood(mood);

    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      setPlaylist(data);
      if (shouldSaveHistory) {
        saveToHistory(mood);
      }
    } catch (e) {
      console.error("Fetch playlist error:", e);
      setError(e.message || "Could not generate mood playlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMobileUrl = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-3.5 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Mobile QR Code Modal */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center relative">
            <button
              onClick={() => setShowMobileModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Open on Your Phone 📱</h3>
              <p className="text-xs text-slate-400 mt-1">
                Make sure your phone is connected to the <b>same Wi-Fi</b> network!
              </p>
            </div>

            {/* QR Code */}
            <div className="p-4 bg-white rounded-2xl inline-block mx-auto shadow-inner">
              <QRCodeSVG value={mobileUrl} size={180} level="M" />
            </div>

            {/* URL with Copy button */}
            <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-left">
              <span className="text-xs text-emerald-400 font-mono flex-1 truncate">{mobileUrl}</span>
              <button
                onClick={handleCopyMobileUrl}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1"
                title="Copy URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Scan with your Camera or type the URL above into your phone's browser (Safari, Chrome).
            </p>
          </div>
        </div>
      )}

      {/* Top Navbar / Header */}
      <div className="w-full max-w-4xl flex items-center justify-between z-20 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Headphones className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-lg sm:text-xl font-extrabold text-white tracking-tight">AuraBeat</span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-3 h-3" />
              <span>100% Ad-Free • HD Audio</span>
            </div>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMobileModal(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-xs font-semibold text-emerald-400 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Open on Phone</span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <main className="w-full max-w-4xl z-10 flex flex-col items-center space-y-6 my-auto py-2">
        {/* Header Hero */}
        <header className="text-center space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-medium shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI DJ Powered by Gemini & Full-Length Studio Streaming</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Your Vibe, Your Music
          </h1>

          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Speak or type your current feeling — get instant full-length original songs & playlists.
          </p>
        </header>

        {/* Mood Input Component */}
        <div className="w-full">
          <MoodInput onSubmit={handleMoodSubmit} loading={loading} />
        </div>

        {/* History Chips */}
        {history.length > 0 && !loading && (
          <div className="w-full flex items-center gap-2 flex-wrap text-xs text-slate-400">
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <History className="w-3.5 h-3.5" />
              Recent:
            </span>
            {history.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleMoodSubmit(item)}
                className="px-2.5 py-1 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-emerald-400 transition-all truncate max-w-[150px]"
                title={item}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="w-full py-14 flex flex-col items-center justify-center space-y-4 bg-slate-900/80 border border-slate-800 rounded-3xl">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
            <div className="text-center space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-white">Curating your playlist with Gemini AI…</h3>
              <p className="text-xs text-slate-400">Finding real original tracks, artwork, and full-length master streams...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <div className="w-full p-4 bg-rose-950/50 border border-rose-800/60 rounded-2xl flex items-center justify-between gap-4 text-rose-300 text-xs sm:text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            {lastMood && (
              <button
                onClick={() => handleMoodSubmit(lastMood)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Player Component */}
        {playlist && !loading && (
          <Player playlist={playlist} onRefreshPlaylist={handleMoodSubmit} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl text-center py-5 text-[11px] text-slate-400 border-t border-slate-900 mt-8 z-10">
        <p>AuraBeat — AI Mood Music Player • 100% Free & Ad-Free • Designed for Desktop & Mobile Web</p>
      </footer>
    </div>
  );
}
