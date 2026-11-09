// src/index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("AuraBeat ErrorBoundary caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-12 h-12 rounded-full bg-[#1ed760] text-black font-extrabold text-xl flex items-center justify-center mb-4">
            A
          </div>
          <h1 className="text-2xl font-black text-white mb-2">AuraBeat Spotify</h1>
          <p className="text-sm text-[#b3b3b3] max-w-sm mb-6">
            Loading fresh session... Click below to reload:
          </p>
          <button
            onClick={() => {
              try { localStorage.clear(); } catch(e) {}
              window.location.reload();
            }}
            className="px-6 py-2.5 bg-[#1ed760] hover:bg-[#1fdf64] text-black font-extrabold text-xs rounded-full shadow-lg transition-all"
          >
            Reload AuraBeat
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
