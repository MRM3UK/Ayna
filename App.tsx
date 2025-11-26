import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Row from './components/Row';
import Grid from './components/Grid';
import VideoPlayer from './components/VideoPlayer';
import Settings from './components/Settings';
import { parseM3U, DEFAULT_PLAYLIST_URL } from './utils/parser';
import { PlaylistState, Channel, ViewState } from './types';
import { Loader2, Tv, Trophy, Film, Music, Newspaper, Globe, Smile } from 'lucide-react';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>(ViewState.BROWSE);
  const [data, setData] = useState<PlaylistState>({
    url: localStorage.getItem('playlist_url') || DEFAULT_PLAYLIST_URL,
    channels: [],
    categories: [],
    isLoading: true,
    error: null,
  });
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  
  // Favorites State
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  // History State
  const [history, setHistory] = useState<Channel[]>(() => {
    const saved = localStorage.getItem('watch_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch and Parse Playlist
  useEffect(() => {
    const fetchPlaylist = async () => {
      setData(prev => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await fetch(data.url);
        if (!response.ok) throw new Error('Failed to fetch playlist');
        const text = await response.text();
        const { channels, categories } = parseM3U(text);
        
        setData(prev => ({
          ...prev,
          channels,
          categories,
          isLoading: false
        }));
      } catch (err) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load playlist. Please check your URL or internet connection.'
        }));
      }
    };

    fetchPlaylist();
  }, [data.url]);

  // Handle Favorites Persistence
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  // Handle History Persistence
  useEffect(() => {
    localStorage.setItem('watch_history', JSON.stringify(history));
  }, [history]);

  const toggleFavorite = (channel: Channel) => {
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(channel.id)) {
        newFavs.delete(channel.id);
      } else {
        newFavs.add(channel.id);
      }
      return newFavs;
    });
  };

  const addToHistory = (channel: Channel) => {
    setHistory(prev => {
      // Remove if exists to push to top
      const filtered = prev.filter(c => c.id !== channel.id);
      return [channel, ...filtered].slice(0, 50); // Keep last 50
    });
  };

  // Handle Search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setViewState(ViewState.SEARCH);
    } else if (viewState === ViewState.SEARCH) {
      setViewState(ViewState.BROWSE);
    }
  };

  // Handle Play Action
  const handlePlay = (channel: Channel) => {
    addToHistory(channel);
    setSelectedChannel(channel);
    setViewState(ViewState.WATCH);
  };

  // Handle Category Select
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setViewState(ViewState.CATEGORY);
  };

  // Handle Settings Update
  const updatePlaylist = (newUrl: string) => {
    if (!newUrl) return;
    localStorage.setItem('playlist_url', newUrl);
    setData(prev => ({ ...prev, url: newUrl }));
    setViewState(ViewState.BROWSE);
  };

  const resetPlaylist = () => {
    localStorage.removeItem('playlist_url');
    setData(prev => ({ ...prev, url: DEFAULT_PLAYLIST_URL }));
    setViewState(ViewState.BROWSE);
  };

  // Get filtered channels for views
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return data.channels.filter(c => c.name.toLowerCase().includes(lowerQuery));
  }, [searchQuery, data.channels]);

  const favoriteChannels = useMemo(() => {
    return data.channels.filter(c => favorites.has(c.id));
  }, [favorites, data.channels]);

  const categoryChannels = useMemo(() => {
    if (!selectedCategory) return [];
    return data.categories.find(c => c.name === selectedCategory)?.channels || [];
  }, [selectedCategory, data.categories]);

  // Get a featured channel
  const featuredChannel = useMemo(() => {
    if (data.channels.length > 0) {
      const withLogo = data.channels.filter(c => c.logo && c.logo.length > 0);
      if (withLogo.length > 0) {
        return withLogo[Math.floor(Math.random() * Math.min(withLogo.length, 20))];
      }
      return data.channels[0];
    }
    return null;
  }, [data.channels]);

  // Helper to get Icon for category
  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('sport')) return <Trophy className="w-4 h-4" />;
    if (lower.includes('movie') || lower.includes('film') || lower.includes('cinema')) return <Film className="w-4 h-4" />;
    if (lower.includes('news')) return <Newspaper className="w-4 h-4" />;
    if (lower.includes('music') || lower.includes('radio')) return <Music className="w-4 h-4" />;
    if (lower.includes('kid') || lower.includes('cartoon') || lower.includes('animation')) return <Smile className="w-4 h-4" />;
    if (lower.includes('doc')) return <Globe className="w-4 h-4" />;
    return <Tv className="w-4 h-4" />;
  };

  // Main Render Logic
  return (
    <div className="min-h-screen bg-[#141414] text-white font-sans selection:bg-red-600 selection:text-white">
      {/* Navigation */}
      <Navbar 
        setViewState={setViewState} 
        activeView={viewState} 
        onSearch={handleSearch}
        searchQuery={searchQuery}
      />

      {/* Content Area */}
      {viewState === ViewState.WATCH && selectedChannel ? (
        <VideoPlayer 
          channel={selectedChannel} 
          onClose={() => setViewState(ViewState.BROWSE)} 
          isFavorite={favorites.has(selectedChannel.id)}
          onToggleFavorite={toggleFavorite}
        />
      ) : viewState === ViewState.SETTINGS ? (
        <Settings 
          currentUrl={data.url} 
          onSave={updatePlaylist}
          onReset={resetPlaylist}
        />
      ) : (
        /* CONTENT VIEWS */
        <div className="pb-20">
          {data.isLoading ? (
             <div className="h-screen flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                <p className="text-gray-400 animate-pulse">Loading Channels...</p>
             </div>
          ) : data.error ? (
             <div className="h-screen flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-2xl font-bold text-red-500 mb-2">Oops! Something went wrong.</h2>
                <p className="text-gray-400 mb-6">{data.error}</p>
                <button 
                  onClick={() => setViewState(ViewState.SETTINGS)}
                  className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-gray-200 transition"
                >
                  Check Settings
                </button>
             </div>
          ) : (
            <>
              {viewState === ViewState.SEARCH ? (
                <Grid 
                  title={`Results for "${searchQuery}"`}
                  channels={searchResults} 
                  onPlay={handlePlay} 
                />
              ) : viewState === ViewState.FAVORITES ? (
                <Grid 
                  title="My List"
                  channels={favoriteChannels} 
                  onPlay={handlePlay} 
                />
              ) : viewState === ViewState.HISTORY ? (
                <Grid 
                  title="Watch History"
                  channels={history} 
                  onPlay={handlePlay} 
                />
              ) : viewState === ViewState.CATEGORY ? (
                <Grid 
                  title={selectedCategory || 'Category'}
                  channels={categoryChannels} 
                  onPlay={handlePlay} 
                />
              ) : (
                /* BROWSE (HOME) */
                <>
                  <Hero featuredChannel={featuredChannel} onPlay={handlePlay} />
                  
                  {/* Category Pills Bar */}
                  <div className="sticky top-16 z-40 bg-[#141414]/95 backdrop-blur-sm border-b border-white/10 py-3 mb-6">
                    <div className="px-4 md:px-12 overflow-x-auto no-scrollbar flex gap-3">
                      {data.categories.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => handleCategorySelect(cat.name)}
                          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white text-white hover:text-black transition text-sm whitespace-nowrap border border-white/10"
                        >
                          {getCategoryIcon(cat.name)}
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative z-10 space-y-4 min-h-[50vh]">
                    {data.categories.map((category) => (
                      <Row 
                        key={category.name} 
                        title={category.name} 
                        channels={category.channels} 
                        onPlay={handlePlay}
                        onSeeAll={handleCategorySelect}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;