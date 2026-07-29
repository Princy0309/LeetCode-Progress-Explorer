import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const sentences = [
  "search profiles of people across the world",
  "compare progress with friends and people",
  "set goals and achieve them!"
];

const TYPE_SPEED   = 60;  // ms per character while typing
const DELETE_SPEED = 18;   // ms per character while deleting
const PAUSE_AFTER  = 2400; // ms to hold the completed sentence
const PAUSE_BEFORE = 500;  // ms pause on empty string before next sentence

export default function Home({ darkMode }) {
  const [displayText, setDisplayText] = useState('');
  
  // All mutable loop state lives in a single ref — never causes re-renders,
  // so the setTimeout chain is never accidentally restarted.
  const state = useRef({
    sentenceIndex: 0,
    charIndex: 0,
    isDeleting: false,
  });

  useEffect(() => {
    let timer;

    function tick() {
      const { sentenceIndex, charIndex, isDeleting } = state.current;
      const full = sentences[sentenceIndex];

      if (!isDeleting) {
        // --- typing ---
        const next = charIndex + 1;
        setDisplayText(full.slice(0, next));
        state.current.charIndex = next;

        if (next === full.length) {
          // Finished typing — pause, then switch to deleting
          state.current.isDeleting = true;
          timer = setTimeout(tick, PAUSE_AFTER);
        } else {
          timer = setTimeout(tick, TYPE_SPEED);
        }
      } else {
        // --- deleting ---
        const next = charIndex - 1;
        setDisplayText(full.slice(0, next));
        state.current.charIndex = next;

        if (next === 0) {
          // Finished deleting — advance sentence, pause, then start typing
          state.current.isDeleting = false;
          state.current.sentenceIndex = (sentenceIndex + 1) % sentences.length;
          timer = setTimeout(tick, PAUSE_BEFORE);
        } else {
          timer = setTimeout(tick, DELETE_SPEED);
        }
      }
    }

    timer = setTimeout(tick, TYPE_SPEED);
    return () => clearTimeout(timer);
  }, []); // runs once — the loop is self-sustaining via setTimeout chain

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center min-vh-75 text-center px-3 py-5"
      style={{ marginTop: '10vh' }}
    >
      <h1 className="display-5 fw-bold mb-4 text-break">Welcome to Lead-your-leet!</h1>

      <div
        className="p-4 p-md-5 rounded shadow-lg w-100 mb-4"
        style={{
          maxWidth: '800px',
          background: darkMode ? '#1e1e1e' : '#f8f9fa',
          minHeight: '160px',
        }}
      >
        <p className="fs-4 font-monospace mb-0 text-break">
          {displayText}
          <span className="typewriter-cursor" aria-hidden="true">|</span>
        </p>
      </div>

      <Link to="/dashboard" className="btn fire-btn px-4 py-2 rounded-pill fs-5">
        Get Started →
      </Link>
    </div>
  );
}
