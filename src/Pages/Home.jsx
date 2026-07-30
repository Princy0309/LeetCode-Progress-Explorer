import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/AuthModal';

const sentences = [
  "search profiles of people across the world",
  "compare progress with friends and people",
  "set goals and achieve them!"
];

const TYPE_SPEED   = 50;
const DELETE_SPEED = 18;
const PAUSE_AFTER  = 2400;
const PAUSE_BEFORE = 500;

export default function Home({ darkMode }) {
  const { isLoggedIn, profile } = useAuth();
  const [displayText, setDisplayText] = useState('');

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
        const next = charIndex + 1;
        setDisplayText(full.slice(0, next));
        state.current.charIndex = next;
        if (next === full.length) {
          state.current.isDeleting = true;
          timer = setTimeout(tick, PAUSE_AFTER);
        } else {
          timer = setTimeout(tick, TYPE_SPEED);
        }
      } else {
        const next = charIndex - 1;
        setDisplayText(full.slice(0, next));
        state.current.charIndex = next;
        if (next === 0) {
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
  }, []);

  return (
    <div
      className="container d-flex flex-column justify-content-center align-items-center text-center px-3 py-5"
      style={{ marginTop: '8vh', minHeight: '75vh' }}
    >
      {/* ── Personalised greeting when logged in ── */}
      {isLoggedIn && (
        <div className="home-greeting-card mb-4">
          <Avatar displayName={profile.displayName} color={profile.avatarColor} size={56} />
          <div className="home-greeting-text">
            <span className="home-greeting-welcome">Welcome back,</span>
            <span className="home-greeting-name">{profile.displayName}! 👋</span>
          </div>
        </div>
      )}

      <h1 className="display-5 fw-bold mb-4 text-break">
        {isLoggedIn ? 'Ready to grind today?' : 'Welcome to Lead-your-leet!'}
      </h1>

      {/* Typewriter box */}
      <div
        className="p-4 p-md-5 rounded shadow-lg w-100 mb-4"
        style={{
          maxWidth: '800px',
          background: darkMode ? '#1e1e1e' : '#f8f9fa',
          minHeight: '140px',
        }}
      >
        <p className="fs-4 font-monospace mb-0 text-break">
          {displayText}
          <span className="typewriter-cursor" aria-hidden="true">|</span>
        </p>
      </div>

      {/* CTA buttons */}
      <div className="d-flex gap-3 flex-wrap justify-content-center">
        <Link to="/dashboard" className="btn fire-btn px-4 py-2 rounded-pill fs-5">
          {isLoggedIn ? 'Go to Dashboard →' : 'Get Started →'}
        </Link>
        {isLoggedIn && (
          <Link to="/practice" className="btn btn-outline-secondary px-4 py-2 rounded-pill fs-5">
            My Goals 🎯
          </Link>
        )}
      </div>
    </div>
  );
}



