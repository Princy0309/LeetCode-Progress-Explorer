import React, { useEffect, useRef } from 'react';
import SearchBox from '../components/searchBox';
import UserProfile from '../components/UserProfile';
import Badges from '../components/Badges';
import ContestStats from '../components/ContestStats';
import VisualInsights from '../components/VisualInsights';
import RecentSubmissions from '../components/RecentSubmissions';
import StreakCard from '../components/StreakCard';
import PracticeRecommendations from '../components/PracticeRecommendations';

/**
 * Watches the feed container for any .dashboard-card-wrap elements —
 * both ones already in the DOM and ones added later (after data loads).
 * Each card starts invisible+shifted and transitions in when it enters
 * the viewport.
 */
function useScrollReveal(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // The IntersectionObserver that animates a card in
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Small delay so the browser has painted the hidden state first
            requestAnimationFrame(() => {
              entry.target.classList.add('reveal-visible');
            });
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    let revealIndex = 0;

    // Attach reveal classes and observe a single card
    function watchCard(card) {
      if (card.dataset.revealBound) return; // already watching
      card.dataset.revealBound = '1';
      card.dataset.revealIndex = String(revealIndex++);
      card.classList.add('reveal-hidden');
      io.observe(card);
    }

    // Watch cards already in the DOM
    container.querySelectorAll('.dashboard-card-wrap').forEach(watchCard);

    // Watch cards added later (React renders new ones when data arrives)
    const mo = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (node.classList.contains('dashboard-card-wrap')) {
            watchCard(node);
          }
          // In case React inserts a wrapper around the card
          node.querySelectorAll?.('.dashboard-card-wrap').forEach(watchCard);
        });
      });
    });

    mo.observe(container, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [containerRef]); // containerRef is stable — runs once on mount only
}

export default function Dashboard({
  username,
  setUsername,
  userData,
  badges,
  contestData,
  submissions,
  streakData,
  loading,
  error,
  onSearch
}) {
  const feedRef = useRef(null);
  useScrollReveal(feedRef);

  return (
    <div ref={feedRef} className="container mt-5 dashboard-feed">
      <h1 className="text-center mb-4">Leetcode Progress Explorer</h1>

      <SearchBox
        username={username}
        setUsername={setUsername}
        onSearch={() => onSearch(username)}
        loading={loading}
      />

      {error && (
        <div className="alert alert-danger text-center my-3" role="alert">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center my-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading....</span>
          </div>
        </div>
      )}

      {!loading && userData && (
        <div className="dashboard-card-wrap">
          <UserProfile data={userData} />
        </div>
      )}
      {streakData && (
        <div className="dashboard-card-wrap">
          <StreakCard streakData={streakData} />
        </div>
      )}
      {userData && (
        <div className="dashboard-card-wrap">
          <VisualInsights solved={userData} submissions={submissions} />
        </div>
      )}
      {badges && (
        <div className="dashboard-card-wrap">
          <Badges badges={badges} />
        </div>
      )}
      {contestData && (
        <div className="dashboard-card-wrap">
          <ContestStats contestData={contestData} />
        </div>
      )}
      {submissions && (
        <div className="dashboard-card-wrap">
          <RecentSubmissions submissions={submissions} />
        </div>
      )}
    </div>
  );
}
