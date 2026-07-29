import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY   = 'lc_profiles';      // all saved profiles
const ACTIVE_KEY    = 'lc_active_profile'; // username of the logged-in profile

function loadProfiles() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveProfiles(profiles) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export function AuthProvider({ children }) {
  const [profiles, setProfiles] = useState(loadProfiles);

  const [activeUsername, setActiveUsername] = useState(
    () => localStorage.getItem(ACTIVE_KEY) || null
  );

  const profile = activeUsername ? profiles[activeUsername] ?? null : null;

  // Create a new profile and log in as it
  const signUp = useCallback((username, avatarColor, displayName) => {
    const trimmed = username.trim();
    if (!trimmed) throw new Error('Username cannot be empty.');
    if (profiles[trimmed]) throw new Error('That username is already taken.');

    const newProfile = {
      username:    trimmed,
      displayName: displayName?.trim() || trimmed,
      avatarColor,
      createdAt:   Date.now(),
    };

    const updated = { ...profiles, [trimmed]: newProfile };
    saveProfiles(updated);
    setProfiles(updated);
    localStorage.setItem(ACTIVE_KEY, trimmed);
    setActiveUsername(trimmed);
  }, [profiles]);

  // Log in to an existing profile
  const signIn = useCallback((username) => {
    const trimmed = username.trim();
    if (!profiles[trimmed]) throw new Error('No profile found with that username.');
    localStorage.setItem(ACTIVE_KEY, trimmed);
    setActiveUsername(trimmed);
  }, [profiles]);

  // Log out (keep profile data intact)
  const signOut = useCallback(() => {
    localStorage.removeItem(ACTIVE_KEY);
    setActiveUsername(null);
  }, []);

  // Delete a profile entirely
  const deleteProfile = useCallback((username) => {
    const updated = { ...profiles };
    delete updated[username];
    saveProfiles(updated);
    setProfiles(updated);
    if (activeUsername === username) {
      localStorage.removeItem(ACTIVE_KEY);
      setActiveUsername(null);
    }
  }, [profiles, activeUsername]);

  return (
    <AuthContext.Provider value={{
      profile,
      profiles,
      activeUsername,
      signUp,
      signIn,
      signOut,
      deleteProfile,
      isLoggedIn: !!profile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
