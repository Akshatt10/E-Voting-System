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
import ElectionDetails from './pages/Election_details';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/vote-status" element={<VoteStatus />} />
          <Route path="/create-voting" element={<CreateVoting />} />
          <Route path="/reschedule-voting" element={<RescheduleVoting />} />
          <Route path="/cancel-voting" element={<CancelVoting />} />
          <Route path="/profile" element={<Profile />} />
          
        </Route>
        <Route path="/election/:id" element={<ElectionDetails />} />

        {/* Catch-all */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
