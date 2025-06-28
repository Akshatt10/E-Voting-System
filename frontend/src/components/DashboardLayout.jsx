// src/layouts/DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaVoteYea, FaCalendarAlt, FaTrashAlt, FaCheckCircle, FaUserCircle, FaBars, FaTimes, FaTachometerAlt } from 'react-icons/fa';

const DashboardLayout = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return setError('No token found');
      
      try {
        const res = await fetch('/api/auth/current-user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch user data');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setError('Error loading user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const navItems = [
    {
      to: '/dashboard',
      icon: FaTachometerAlt,
      label: 'Dashboard',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      to: '/create-voting',
      icon: FaVoteYea,
      label: 'New Voting Event',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      to: '/reschedule-voting',
      icon: FaCalendarAlt,
      label: 'Reschedule Voting',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      to: '/cancel-voting',
      icon: FaTrashAlt,
      label: 'Cancel Voting',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      to: '/vote-status',
      icon: FaCheckCircle,
      label: 'Status of Voting',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    }
  ];

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl relative overflow-hidden">
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 pointer-events-none"></div>
          
          {/* Header */}
          <div className="relative z-10 text-center py-8 border-b border-slate-700/50">
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent text-3xl font-bold mb-2">
              iBC Voting
            </div>
            <div className="text-slate-400 text-sm font-medium">
              Digital Democracy Platform
            </div>
          </div>

          {/* Navigation */}
          <nav className="relative z-10 flex flex-col gap-2 px-4 py-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.to);
              
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`
                    group relative overflow-hidden rounded-xl transition-all duration-300 transform
                    ${isActive 
                      ? `bg-gradient-to-r ${item.color} shadow-lg scale-105 shadow-${item.color.split('-')[1]}-500/25` 
                      : 'hover:scale-105 hover:shadow-lg'
                    }
                  `}
                >
                  <div className={`
                    flex items-center gap-4 p-4 relative z-10 transition-all duration-300
                    ${isActive 
                      ? 'text-white' 
                      : `text-slate-300 hover:text-white group-hover:bg-gradient-to-r group-hover:${item.color}`
                    }
                  `}>
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300
                      ${isActive 
                        ? 'bg-white/20 shadow-inner' 
                        : 'bg-slate-700/50 group-hover:bg-white/20'
                      }
                    `}>
                      <Icon className="text-lg" />
                    </div>
                    <span className="font-medium text-sm tracking-wide">
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="ml-auto">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover effect overlay */}
                  {!isActive && (
                    <div className={`
                      absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 
                      group-hover:opacity-100 transition-opacity duration-300
                    `}></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom decoration */}
          <div className="mt-auto p-4 relative z-10">
            <div className="h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mb-4"></div>
            <div className="text-center text-slate-500 text-xs">
              Secure • Transparent • Democratic
            </div>
          </div>
        </aside>
      )}

      {/* Topbar and Main Content */}
      <div className="flex-1 transition-all duration-300">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="group p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-all duration-200 hover:scale-105"
                title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
              >
                <div className="relative">
                  {isSidebarOpen ? (
                    <FaTimes className="text-xl transition-transform group-hover:rotate-90" />
                  ) : (
                    <FaBars className="text-xl transition-transform group-hover:scale-110" />
                  )}
                </div>
              </button>
              
              <div className="flex flex-col">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back!
                </div>
                <div className="text-sm text-gray-600">
                  {user ? `${user.firstname} ${user.lastname}` : 'Loading...'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 text-blue-700 hover:text-blue-800 transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                <FaUserCircle className="text-xl group-hover:scale-110 transition-transform" />
                <span className="font-medium">Profile</span>
              </Link>
              
              <Link
                to="/logout"
                className="group px-4 py-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 hover:from-red-500 hover:to-red-600 text-red-600 hover:text-white font-medium transition-all duration-200 hover:scale-105 hover:shadow-md"
              >
                Logout
              </Link>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;