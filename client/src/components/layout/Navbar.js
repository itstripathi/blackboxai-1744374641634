import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <i className="fas fa-sitemap text-primary-600 text-2xl mr-2"></i>
                <span className="text-xl font-serif font-bold text-gray-900">
                  Taxonomy Manager
                </span>
              </Link>
            </div>
          </div>

          {user && (
            <div className="flex items-center">
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                >
                  <i className="fas fa-user mr-2"></i>
                  {user.username}
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/users"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                  >
                    <i className="fas fa-users mr-2"></i>
                    Users
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center">
                <button
                  type="button"
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-150"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  <i className="fas fa-bars"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            to="/profile"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
          >
            Profile
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/users"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
            >
              Users
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
