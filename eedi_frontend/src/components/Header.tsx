import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg 
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h1 className="ml-3 text-2xl font-bold">Math Misconception Analyzer</h1>
            </div>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-white hover:text-blue-200 transition">Home</a>
            <a href="#" className="text-white hover:text-blue-200 transition">About</a>
            <a href="#" className="text-white hover:text-blue-200 transition">Documentation</a>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header; 