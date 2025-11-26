import React from 'react';
import { Channel } from '../types';
import { Play } from 'lucide-react';

interface GridProps {
  title: string;
  channels: Channel[];
  onPlay: (channel: Channel) => void;
}

const Grid: React.FC<GridProps> = ({ title, channels, onPlay }) => {
  return (
    <div className="pt-24 px-4 md:px-12 pb-12">
      <h2 className="text-2xl font-bold text-white mb-6">{title} <span className="text-gray-500 text-lg font-normal ml-2">({channels.length})</span></h2>
      
      {channels.length === 0 ? (
        <div className="text-gray-500 text-center py-20">
          <p className="text-xl">No channels found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 gap-y-8">
          {channels.map((channel) => {
            return (
              <div 
                key={channel.id} 
                className="group relative bg-gray-900 rounded-md overflow-hidden aspect-video transition-transform duration-300 hover:scale-105 hover:z-20 netflix-shadow cursor-pointer"
                onClick={() => onPlay(channel)}
              >
                 <div className="w-full h-full">
                   {channel.logo ? (
                     <img 
                       src={channel.logo} 
                       alt={channel.name} 
                       className="w-full h-full object-cover opacity-80 group-hover:opacity-40 transition-opacity"
                       loading="lazy"
                       onError={(e) => {
                         (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=random&color=fff&size=256`;
                       }}
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 font-bold text-sm p-2 text-center">
                       {channel.name}
                     </div>
                   )}
                 </div>

                 {/* Badge */}
                 <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] text-gray-200 font-bold uppercase tracking-wide">
                    {channel.group}
                 </div>

                 <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                 </div>
                 
                 <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                   <p className="text-white text-xs font-semibold truncate text-center drop-shadow-md">{channel.name}</p>
                 </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Grid;