// src/components/MoodInput.jsx
import React, { useState, useEffect } from "react";
import { Mic, MicOff, Sparkles, Send, Shuffle, X, Globe2 } from "lucide-react";

const LANGUAGES = [
  { label: "Kannada", emoji: "🟡", query: "Kannada" },
  { label: "Hindi", emoji: "🇮🇳", query: "Hindi Bollywood" },
  { label: "Konkani", emoji: "🌴", query: "Konkani Goa Mangalore" },
  { label: "English", emoji: "🇺🇸", query: "English Western Pop" },
  { label: "Punjabi", emoji: "👳", query: "Punjabi" },
  { label: "Tamil", emoji: "✨", query: "Tamil" },
  { label: "Telugu", emoji: "🕺", query: "Telugu" },
  { label: "Malayalam", emoji: "🥥", query: "Malayalam" },
  { label: "Spanish", emoji: "💃", query: "Spanish Latino" },
  { label: "K-Pop", emoji: "🇰🇷", query: "Korean K-Pop" },
];

const PRESET_MOODS = [
  { label: "Deep Focus", emoji: "💻", text: "late night coding focus synthwave" },
  { label: "Workout Beast", emoji: "🔥", text: "high energy gym workout hype" },
  { label: "Cozy Lofi", emoji: "☕", text: "rainy afternoon coffee shop lofi beats" },
  { label: "Party Dance", emoji: "💃", text: "high energy party dance hits" },
  { label: "Night Drive", emoji: "🚗", text: "cyberpunk synthwave 80s midnight drive" },
  { label: "Zen Peace", emoji: "🧘", text: "calm acoustic meditation and deep relaxation" },
  { label: "Feel Good", emoji: "☀️", text: "sunny happy vibes indie pop euphoria" },
  { label: "Romantic Feel", emoji: "❤️", text: "heartwarming romantic melodious songs" },
];

export default function MoodInput({ onSubmit, loading }) {
  const [mood, setMood] = useState("");
  const [selectedLang, setSelectedLang] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);

  useEffect(() => {
    if (!("SpeechRecognition" in window) && !("webkitSpeechRecognition" in window)) {
      setVoiceSupported(false);
    }
  }, []);

  const handleChange = (e) => setMood(e.target.value);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!mood.trim() || loading) return;
    const finalQuery = selectedLang && !mood.toLowerCase().includes(selectedLang.toLowerCase())
      ? `${mood.trim()} in ${selectedLang}`
      : mood.trim();
    onSubmit(finalQuery);
  };

  const handlePresetClick = (presetText) => {
    const finalQuery = selectedLang && !presetText.toLowerCase().includes(selectedLang.toLowerCase())
      ? `${presetText} in ${selectedLang}`
      : presetText;
    setMood(finalQuery);
    onSubmit(finalQuery);
  };

  const handleLanguageClick = (lang) => {
    if (selectedLang === lang.label) {
      setSelectedLang(null);
    } else {
      setSelectedLang(lang.label);
      if (mood.trim()) {
        const queryWithLang = `${mood.trim()} in ${lang.label}`;
        setMood(queryWithLang);
        onSubmit(queryWithLang);
      } else {
        const queryWithLang = `${lang.label} songs`;
        setMood(queryWithLang);
        onSubmit(queryWithLang);
      }
    }
  };

  const handleSurpriseMe = () => {
    const random = PRESET_MOODS[Math.floor(Math.random() * PRESET_MOODS.length)];
    const finalQuery = selectedLang && !random.text.toLowerCase().includes(selectedLang.toLowerCase())
      ? `${random.text} in ${selectedLang}`
      : random.text;
    setMood(finalQuery);
    onSubmit(finalQuery);
  };

  const toggleVoice = () => {
    if (!voiceSupported) {
      alert("Speech recognition is not supported on this browser. Please type your mood.");
      return;
    }

    if (isListening) {
      setIsListening(false);
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
        setMood(transcript);
        setIsListening(false);
        if (transcript.trim()) {
          const finalQuery = selectedLang && !transcript.toLowerCase().includes(selectedLang.toLowerCase())
            ? `${transcript.trim()} in ${selectedLang}`
            : transcript.trim();
          onSubmit(finalQuery);
        }
      };

      recognizer.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Language Selector Filter Row with Konkani */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="flex items-center gap-1 text-slate-400 font-semibold px-1 flex-shrink-0">
          <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Language:</span>
        </span>
        {LANGUAGES.map((lang, idx) => {
          const isSelected = selectedLang === lang.label;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleLanguageClick(lang)}
              className={`px-2.5 py-1 rounded-xl font-medium flex items-center gap-1 flex-shrink-0 transition-all ${
                isSelected
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20 scale-105"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              <span>{lang.emoji}</span>
              <span>{lang.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Search Input */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 sm:p-2 shadow-xl transition-all duration-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
          <div className="pl-2 sm:pl-3 pr-1 text-emerald-400">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>

          <input
            type="text"
            placeholder={
              isListening 
                ? "Listening to your voice..." 
                : selectedLang 
                  ? `Describe mood in ${selectedLang} (e.g. romantic, party dance, workout)...`
                  : "Describe mood & language (e.g. Konkani classics, Kannada romantic, Hindi party)..."
            }
            value={mood}
            onChange={handleChange}
            disabled={loading}
            className="flex-1 bg-transparent py-2.5 sm:py-3 px-2 text-white placeholder-slate-400 focus:outline-none text-xs sm:text-base font-medium"
          />

          {mood && (
            <button
              type="button"
              onClick={() => setMood("")}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Clear text"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              disabled={loading}
              title={isListening ? "Stop listening" : "Voice input"}
              className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 ml-1 ${
                isListening
                  ? "bg-rose-500 text-white animate-bounce shadow-lg shadow-rose-500/30"
                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !mood.trim()}
            className="ml-1.5 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 text-xs sm:text-sm active:scale-95"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Vibe</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset mood chips & Surprise button */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Quick Mood Presets
          </span>
          <button
            onClick={handleSurpriseMe}
            disabled={loading}
            className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 transition-colors py-0.5 px-1.5 rounded-lg hover:bg-slate-800"
          >
            <Shuffle className="w-3 h-3" />
            <span>Surprise Me</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESET_MOODS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handlePresetClick(preset.text)}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-900/70 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-medium transition-all duration-150 active:scale-95 shadow-sm"
            >
              <span>{preset.emoji}</span>
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
