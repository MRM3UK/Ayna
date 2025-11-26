import React from 'react';
import { Play, Info } from 'lucide-react';
import { Channel } from '../types';

interface HeroProps {
  featuredChannel: Channel | null;
  onPlay: (channel: Channel) => void;
}

const Hero: React.FC<HeroProps> = ({ featuredChannel, onPlay }) => {
  if (!featuredChannel) return null;

  return (
    <div className="relative h-[56.25vw] max-h-[80vh] min-h-[400px] w-full bg-[#141414]">
      {/* Background Image / Fallback */}
      <div className="absolute inset-0 overflow-hidden">
        {featuredChannel.logo ? (
           <img 
             src={featuredChannel.logo} 
             className="w-full h-full object-cover opacity-60 blur-sm scale-105" 
             alt="Hero Background"
           />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-900 to-gray-800" />
        )}
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />
      </div>

      <div className="absolute top-[30%] md:top-[40%] left-4 md:left-12 max-w-xl z-10 space-y-4">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg text-white">
          {featuredChannel.name}
        </h1>
        <p className="text-white text-base md:text-lg drop-shadow-md line-clamp-3 md:line-clamp-none max-w-lg text-gray-200">
           Watch live streaming of {featuredChannel.name}. Included in your {featuredChannel.group} package.
           Experience high-definition IPTV streaming directly in your browser.
        </p>

        <div className="flex items-center gap-3 pt-4">
          <button 
            onClick={() => onPlay(featuredChannel)}
            className="flex items-center gap-2 bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded font-bold hover:bg-opacity-80 transition"
          >
            <Play className="fill-black w-5 h-5" />
            Play
          </button>
          <button className="flex items-center gap-2 bg-gray-500/70 text-white px-6 md:px-8 py-2 md:py-3 rounded font-bold hover:bg-opacity-50 transition backdrop-blur-sm">
            <Info className="w-5 h-5" />
            More Info
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
