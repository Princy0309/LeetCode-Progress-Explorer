import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const sentences = [
  "search profiles of people across the world",
  "compare progress with friends and people",
  "set goals and achieve them!"
];

export default function Home({ darkMode }) {
  const [currentText, setCurrentText] = useState("");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(60);

  useEffect(() => {
    const fullText = sentences[sentenceIndex];
    const words = fullText.split(" ");
    const currentWords = currentText ? currentText.split(" ") : [];

    const handleTyping = () => {
      if (!isDeleting) {
        if (currentWords.length < words.length) {
          const nextText = words.slice(0, currentWords.length + 1).join(" ");
          setCurrentText(nextText);
          
          if (currentWords.length + 1 === words.length) {
            setTimeout(() => setIsDeleting(true), 1000);
            setTypingSpeed(30);
          }
        }
      } else {
        if (currentWords.length > 0) {
          const nextText = currentWords.slice(0, currentWords.length - 1).join(" ");
          setCurrentText(nextText);

          if (currentWords.length - 1 === 0) {
            setIsDeleting(false);
            setSentenceIndex((prev) => (prev + 1) % sentences.length);
            setTypingSpeed(60);
          }
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, sentenceIndex, typingSpeed]);

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-75 text-center px-3 py-5" style={{ marginTop: '10vh' }}>
      <h1 className="display-5 fw-bold mb-4 text-break">Welcome to Lead-your-leet!</h1>
      <div className="p-4 p-md-5 rounded shadow-lg w-100 mb-4" style={{ maxWidth: '800px', background: darkMode ? '#1e1e1e' : '#f8f9fa', minHeight: '160px' }}>
        <p className="fs-4 font-monospace mb-0 text-break">
          {currentText}
          <span className="spinner-grow spinner-grow-sm ms-1 align-middle" role="status" aria-hidden="true"></span>
        </p>
      </div>
      <Link to="/dashboard" className="btn fire-btn px-4 py-2 rounded-pill fs-5">
        Get Started →
      </Link>
    </div>
  );
}