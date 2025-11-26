import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, User, Menu, Settings as SettingsIcon, X, Clock } from 'lucide-react';
import { ViewState } from '../types';

interface NavbarProps {
  setViewState: (view: ViewState) => void;
  activeView: ViewState;
  onSearch: (query: string) => void;
  searchQuery: string;
}

const Navbar: React.FC<NavbarProps> = ({ setViewState, activeView, onSearch, searchQuery }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const toggleSearch = () => {
    if (isSearchOpen && searchQuery) {
      onSearch(''); // Clear search on close
    }
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-colors duration-300 ${isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/70 to-transparent'}`}>
      <div className="px-4 md:px-12 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 flex-shrink-0">
          <div 
            className="text-red-600 font-bold text-2xl md:text-3xl cursor-pointer tracking-tighter"
            onClick={() => {
              onSearch('');
              setViewState(ViewState.BROWSE);
            }}
          >
            STREAMFLIX
          </div>
          <ul className="hidden md:flex gap-6 text-sm text-gray-300">
            <li 
              className={`cursor-pointer hover:text-white transition ${activeView === ViewState.BROWSE && !searchQuery ? 'text-white font-medium' : ''}`} 
              onClick={() => {
                onSearch('');
                setViewState(ViewState.BROWSE);
              }}
            >
              Home
            </li>
            <li 
              className={`cursor-pointer hover:text-white transition ${activeView === ViewState.FAVORITES ? 'text-white font-medium' : ''}`} 
              onClick={() => {
                onSearch('');
                setViewState(ViewState.FAVORITES);
              }}
            >
              Favorites
            </li>
            <li 
              className={`cursor-pointer hover:text-white transition ${activeView === ViewState.HISTORY ? 'text-white font-medium' : ''}`} 
              onClick={() => {
                onSearch('');
                setViewState(ViewState.HISTORY);
              }}
            >
              History
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-4 md:gap-6 text-white flex-grow justify-end">
          <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'bg-black/50 border border-white/30 rounded px-2 py-1' : ''}`}>
            <Search 
              className="w-5 h-5 cursor-pointer hover:text-gray-300 flex-shrink-0" 
              onClick={toggleSearch}
            />
            <input 
              ref={searchInputRef}
              type="text"
              className={`bg-transparent border-none focus:ring-0 text-white text-sm ml-2 transition-all duration-300 outline-none ${isSearchOpen ? 'w-32 md:w-60 opacity-100' : 'w-0 opacity-0'}`}
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={handleSearchChange}
              onBlur={() => !searchQuery && setIsSearchOpen(false)}
            />
            {searchQuery && (
              <X 
                className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white ml-2"
                onClick={() => onSearch('')}
              />
            )}
          </div>

          <SettingsIcon 
            className={`w-5 h-5 cursor-pointer hover:text-gray-300 ${activeView === ViewState.SETTINGS ? 'text-red-500' : ''}`} 
            onClick={() => {
              onSearch('');
              setViewState(ViewState.SETTINGS);
            }}
          />
          <Bell className="w-5 h-5 cursor-pointer hover:text-gray-300 hidden sm:block" />
          <div className="flex items-center gap-2 cursor-pointer">
             <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center">
                <User className="w-5 h-5" />
             </div>
          </div>
          <Menu className="md:hidden w-6 h-6 cursor-pointer" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#141414] border-t border-gray-800 absolute w-full px-4 py-4 flex flex-col gap-4">
           <div className="text-gray-300 hover:text-white" onClick={() => { setViewState(ViewState.BROWSE); setIsMobileMenuOpen(false); }}>Home</div>
           <div className="text-gray-300 hover:text-white" onClick={() => { setViewState(ViewState.FAVORITES); setIsMobileMenuOpen(false); }}>Favorites</div>
           <div className="text-gray-300 hover:text-white" onClick={() => { setViewState(ViewState.HISTORY); setIsMobileMenuOpen(false); }}>History</div>
           <div className="text-gray-300 hover:text-white" onClick={() => { setViewState(ViewState.SETTINGS); setIsMobileMenuOpen(false); }}>Settings</div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;