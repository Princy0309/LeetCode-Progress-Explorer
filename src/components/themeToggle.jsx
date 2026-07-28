import React from 'react';

export default function ThemeToggle({ darkMode, setDarkMode }) {
  return (
    <button 
      onClick={() => setDarkMode(!darkMode)} 
      className={`btn btn-sm ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
    >
      {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}