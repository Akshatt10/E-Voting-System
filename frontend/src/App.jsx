import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/SignUp';
import Home from './pages/Home';
import About from './pages/About';
import Dashboard from './pages/Dashboard';
import VoteStatus from './pages/VoteStatus';
import CreateVoting from './pages/CreateVoting';
import RescheduleVoting from './pages/RescheduleVoting';
import CancelVoting from './pages/CancelVoting';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './components/DashboardLayout';
import ElectionDetails from './pages/ElectionDetails';
import VotingPage from './pages/VotingPage';
import VoteResultPage from './pages/VoteResultPage';
import PaymentHistory from './pages/PaymentHistory';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* The Magic Link route for voting (public but secure) */}
        <Route path="/elections/vote/:token" element={<VotingPage />} />

        {/* This route is for logged-in users to see details, but is also public */}
        <Route path="/election/:id" element={<ElectionDetails />} />

        {/* --- PRIVATE ROUTES (for logged-in users only) --- */}
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vote-status" element={<VoteStatus />} />
          <Route path="/create-voting" element={<CreateVoting />} />
          <Route path="/reschedule-voting" element={<RescheduleVoting />} />
          <Route path="/cancel-voting" element={<CancelVoting />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/election/:electionId/results" element={<VoteResultPage />} />
          <Route path="/payment-history" element={<PaymentHistory />} />
        </Route>

        {/* --- CATCH-ALL ROUTE (MUST BE LAST) --- */}
        {/* If no other route matches, this one will be used. */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;