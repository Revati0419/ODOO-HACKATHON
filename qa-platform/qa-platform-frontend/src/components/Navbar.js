import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bell, Search, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { notificationAPI } from '../services/api';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">Q</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:inline">QA Platform</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium">
              Questions
            </Link>
            <Link to="/tags" className="text-gray-700 hover:text-primary-600 font-medium">
              Tags
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/ask"
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  Ask Question
                </Link>
                
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-700 hover:text-primary-600"
                  >
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <NotificationDropdown 
                      onClose={() => setShowNotifications(false)}
                      onUpdateCount={setUnreadCount}
                    />
                  )}
                </div>

                <div className="relative group">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                  >
                    <User className="w-5 h-5" />
                    <span>{user?.username}</span>
                  </Link>
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Profile</Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                  Register
                </Link>
              </div>
            )}
          </div>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-700">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
               <form onSubmit={handleSearch} className="flex">
                 <div className="relative w-full">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"/>
                 </div>
               </form>
               <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium block" onClick={() => setMobileMenuOpen(false)}>Questions</Link>
               <Link to="/tags" className="text-gray-700 hover:text-primary-600 font-medium block" onClick={() => setMobileMenuOpen(false)}>Tags</Link>
              
               {isAuthenticated ? (
                <>
                  <Link to="/ask" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-center" onClick={() => setMobileMenuOpen(false)}>Ask Question</Link>
                  <Link to="/profile" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Profile ({user?.username})</Link>
                  <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left text-red-600 font-medium">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-center" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;