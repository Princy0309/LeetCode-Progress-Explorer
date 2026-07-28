import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import GoalTracker from './Pages/GoalTracker';
import ComparePage from './Pages/ComparePage';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4 px-4">
        <span className="navbar-brand">LeetCode Explorer</span>
        <div className="navbar-nav">
          <Link className="nav-link" to="/">Dashboard</Link>
          <Link className="nav-link" to="/practice">Problem Practice</Link>
          <Link className="nav-link" to="/compare">Compare Users</Link>
        </div>
      </nav>

      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/practice" element={<GoalTracker />} />
          <Route path='/compare' element={<ComparePage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}