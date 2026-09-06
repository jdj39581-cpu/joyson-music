// src/components/MoodInput.jsx
import React, { useState, useEffect } from "react";
import { Mic, MicOff, Sparkles, Send, Shuffle, X, Globe2 } from "lucide-react";

const LANGUAGES = [
  { label: "Kannada", emoji: "🟡", query: "Kannada" },
  { label: "Hindi", emoji: "🇮🇳", query: "Hindi" },
  { label: "Konkani", emoji: "🌴", query: "Konkani" },
  { label: "Telugu", emoji: "🕺", query: "Telugu" },
  { label: "Malayalam", emoji: "🥥", query: "Malayalam" },
  { label: "Tamil", emoji: "✨", query: "Tamil" },
  { label: "Punjabi", emoji: "👳", query: "Punjabi" },
  { label: "English", emoji: "🇺🇸", query: "English" },
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
      setMood(lang.label);
      onSubmit(lang.label);
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
      {/* Language Selector Filter Row with Kannada, Hindi, Konkani, Telugu, Malayalam, Tamil, Punjabi, English */}
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

      {/* Main Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center w-full">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            value={mood}
            onChange={handleChange}
            placeholder={
              selectedLang
                ? `e.g. happy romantic songs in ${selectedLang}...`
                : "e.g. romantic sunset drive, upbeat gym focus, chill evening..."
            }
            disabled={loading}
            className="w-full pl-4 pr-24 py-3.5 sm:py-4 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-2xl sm:rounded-3xl text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
          />

          {mood && (
            <button
              type="button"
              onClick={() => setMood("")}
              className="absolute right-12 p-1.5 text-slate-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Input Button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoice}
              disabled={loading}
              title={isListening ? "Listening... Click to stop" : "Speak your mood"}
              className={`absolute right-3 p-2 rounded-xl transition-all ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!mood.trim() || loading}
          className="ml-2 px-4 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-2xl sm:rounded-3xl flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Vibe</span>
        </button>
      </form>

      {/* Preset Mood Chips & Surprise Me */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          type="button"
          onClick={handleSurpriseMe}
          disabled={loading}
          className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 rounded-xl font-semibold flex items-center gap-1 flex-shrink-0 hover:scale-105 transition-all shadow-sm"
        >
          <Shuffle className="w-3 h-3" />
          <span>Surprise Me</span>
        </button>

        {PRESET_MOODS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handlePresetClick(preset.text)}
            disabled={loading}
            className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl font-medium flex items-center gap-1 flex-shrink-0 transition-all hover:border-slate-700"
          >
            <span>{preset.emoji}</span>
            <span>{preset.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
