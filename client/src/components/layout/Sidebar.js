import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTaxonomy } from '../../contexts/TaxonomyContext';

const Sidebar = () => {
  const { user } = useAuth();
  const { selectedNode } = useTaxonomy();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-lg font-serif font-bold text-gray-900">
                Navigation
              </span>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              <Link
                to="/"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/')
                    ? 'bg-primary-50 text-primary-900 border-l-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                }`}
              >
                <i className="fas fa-sitemap mr-3 text-primary-500"></i>
                Taxonomy Tree
              </Link>

              {user?.role === 'admin' && (
                <>
                  <Link
                    to="/users"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/users')
                        ? 'bg-primary-50 text-primary-900 border-l-4 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }`}
                  >
                    <i className="fas fa-users mr-3 text-primary-500"></i>
                    User Management
                  </Link>

                  <Link
                    to="/register"
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive('/register')
                        ? 'bg-primary-50 text-primary-900 border-l-4 border-primary-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                    }`}
                  >
                    <i className="fas fa-user-plus mr-3 text-primary-500"></i>
                    Add User
                  </Link>
                </>
              )}

              <Link
                to="/profile"
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive('/profile')
                    ? 'bg-primary-50 text-primary-900 border-l-4 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                }`}
              >
                <i className="fas fa-user-circle mr-3 text-primary-500"></i>
                Profile
              </Link>
            </nav>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Selected Node
                  </h3>
                  <p className="text-sm text-primary-600 font-medium mt-1">
                    {selectedNode.name}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
