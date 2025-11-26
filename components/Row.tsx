import React, { useRef } from 'react';
import { Channel } from '../types';
import { ChevronLeft, ChevronRight, Play, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface RowProps {
  title: string;
  channels: Channel[];
  onPlay: (channel: Channel) => void;
  onSeeAll: (categoryName: string) => void;
}

const Row: React.FC<RowProps> = ({ title, channels, onPlay, onSeeAll }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Skip empty rows
  if (channels.length === 0) return null;

  return (
    <div className="mb-8 group relative px-4 md:px-12 space-y-2">
      <div 
        className="flex items-center gap-2 group/title cursor-pointer w-fit"
        onClick={() => onSeeAll(title)}
      >
        <h2 className="text-white text-lg md:text-xl font-semibold group-hover/title:text-red-500 transition">
          {title}
        </h2>
        <div className="text-cyan-500 text-xs font-bold opacity-0 group-hover/title:opacity-100 flex items-center transition-opacity -translate-x-2 group-hover/title:translate-x-0 duration-300">
           See All <ChevronRightIcon className="w-3 h-3 ml-1" />
        </div>
      </div>
      
      <div className="relative group/row">
        <div 
          className="absolute top-0 bottom-0 left-0 bg-black/50 z-20 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition cursor-pointer hover:bg-black/70 rounded-r"
          onClick={() => scroll('left')}
        >
           <ChevronLeft className="text-white w-8 h-8" />
        </div>

        <div 
          ref={rowRef}
          className="flex gap-2 overflow-x-scroll no-scrollbar scroll-smooth py-4 px-1"
        >
          {channels.map((channel) => {
            return (
              <div 
                key={channel.id} 
                className="relative flex-none w-[160px] md:w-[220px] aspect-video-poster rounded-md overflow-hidden bg-gray-800 transition duration-300 ease-in-out hover:scale-110 hover:z-30 group/card netflix-shadow cursor-pointer"
                onClick={() => onPlay(channel)}
              >
                {/* Image Area */}
                <div className="w-full h-full">
                  {channel.logo ? (
                    <img 
                      src={channel.logo} 
                      alt={channel.name} 
                      className="w-full h-full object-cover group-hover/card:opacity-40 transition-opacity"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=random&color=fff&size=256`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-900 group-hover/card:opacity-40 text-center p-2 text-sm font-bold text-gray-500">
                      {channel.name}
                    </div>
                  )}
                </div>
                
                {/* Badge */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-gray-200 font-bold uppercase tracking-wide">
                   {channel.group}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-0 group-hover/card:opacity-100 transition duration-300">
                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                    <p className="text-xs text-white font-semibold text-center px-2 pt-2 drop-shadow-md line-clamp-2">
                      {channel.name}
                    </p>
                </div>
              </div>
            );
          })}
        </div>

        <div 
          className="absolute top-0 bottom-0 right-0 bg-black/50 z-20 w-12 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition cursor-pointer hover:bg-black/70 rounded-l"
          onClick={() => scroll('right')}
        >
           <ChevronRight className="text-white w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default Row;