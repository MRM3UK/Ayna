import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Lock, Unlock } from 'lucide-react';
import { DEFAULT_PLAYLIST_URL } from '../utils/parser';

interface SettingsProps {
  currentUrl: string;
  onSave: (url: string) => void;
  onReset: () => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUrl, onSave, onReset }) => {
  const [url, setUrl] = useState(currentUrl);
  const [isSaved, setIsSaved] = useState(false);
  const [isDefault, setIsDefault] = useState(currentUrl === DEFAULT_PLAYLIST_URL);

  useEffect(() => {
    setIsDefault(url === DEFAULT_PLAYLIST_URL);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(url);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleUseCustom = () => {
    setUrl('');
    setIsDefault(false);
  };

  const handleRestoreDefault = () => {
    setUrl(DEFAULT_PLAYLIST_URL);
    onReset();
    setIsDefault(true);
  };

  return (
    <div className="min-h-screen bg-[#141414] pt-24 px-4 md:px-12 pb-12 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-gray-800 pb-4">Settings</h1>
        
        <div className="bg-gray-900 rounded-lg p-6 md:p-8 space-y-6 shadow-lg border border-gray-800">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-semibold text-white">Playlist Configuration</h2>
             {isDefault && (
               <span className="flex items-center gap-1 text-green-500 text-xs font-bold uppercase tracking-wider bg-green-500/10 px-2 py-1 rounded">
                 <Lock className="w-3 h-3" /> Private Bundle Active
               </span>
             )}
          </div>
          
          <p className="text-gray-400 text-sm">
            Manage your IPTV source. You can use the provided high-quality bundle or switch to your own M3U playlist.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="playlist-url" className="block text-sm font-medium text-gray-300 mb-2">
                M3U Playlist URL
              </label>
              
              {isDefault ? (
                <div className="flex items-center justify-between bg-[#141414] border border-green-900/50 rounded p-4 text-gray-400">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 p-2 rounded-full">
                      <Lock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Default Bundle (Locked)</p>
                      <p className="text-xs text-gray-500">URL is hidden for privacy</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={handleUseCustom}
                    className="text-xs text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white underline-offset-4"
                  >
                    Use Custom URL
                  </button>
                </div>
              ) : (
                <input
                  id="playlist-url"
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-[#141414] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition placeholder-gray-600"
                  placeholder="https://example.com/playlist.m3u"
                  required
                />
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-4">
              {!isDefault && (
                <button 
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded font-bold hover:bg-red-700 transition shadow-lg shadow-red-900/20"
                >
                  <Save className="w-5 h-5" />
                  {isSaved ? 'Saved!' : 'Save Playlist'}
                </button>
              )}

              {!isDefault && (
                <button 
                  type="button"
                  onClick={handleRestoreDefault}
                  className="flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded font-bold hover:bg-gray-700 transition border border-gray-700"
                >
                  <RefreshCw className="w-5 h-5" />
                  Restore Default
                </button>
              )}
              
              {isDefault && (
                 <p className="text-sm text-gray-500 italic">
                   Default playlist is active. All channels are available in the Home tab.
                 </p>
              )}
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-gray-600 text-xs">
          <p>StreamFlix Player v2.0</p>
          <p>HLS Streaming Technology • Auto-Rotation • Favorites</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;