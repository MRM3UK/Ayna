import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import dashjs from 'dashjs';
import { Channel } from '../types';
import { ArrowLeft, Maximize, Minimize, Volume2, VolumeX, Pause, Play, AlertCircle, Settings, PictureInPicture, Monitor, RotateCw, Heart } from 'lucide-react';

interface VideoPlayerProps {
  channel: Channel;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (channel: Channel) => void;
}

type AspectRatio = 'contain' | 'cover' | 'fill';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ channel, onClose, isFavorite, onToggleFavorite }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hlsInstance, setHlsInstance] = useState<Hls | null>(null);
  const [dashInstance, setDashInstance] = useState<any>(null);
  const [levels, setLevels] = useState<{height: number, index: number}[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 is auto
  const [showSettings, setShowSettings] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('contain');
  const [rotation, setRotation] = useState(0);
  
  const controlsTimeoutRef = useRef<number | null>(null);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'k') {
        togglePlay();
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'm') {
        toggleMute();
      } else if (e.key === 'Escape') {
         if (!document.fullscreenElement) {
           onClose();
         }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isFullscreen, isMuted]);

  useEffect(() => {
    let hls: Hls | null = null;
    let dash: any = null;

    const playStream = () => {
      const video = videoRef.current;
      if (!video) return;

      setError(null);
      setLevels([]);
      setCurrentLevel(-1);

      const url = channel.url.trim();
      const isDash = url.toLowerCase().endsWith('.mpd');

      if (isDash) {
        // Initialize DASH Player
        try {
            dash = dashjs.MediaPlayer().create();
            dash.initialize(video, url, true);
            
            dash.on('error', (e: any) => {
                console.error("DASH Error:", e);
                // dashjs retries automatically for many errors, but valid manifest errors might need handling
            });

            setDashInstance(dash);
            video.play().catch(() => setIsPlaying(false));
        } catch (err) {
            console.error(err);
            setError("Failed to initialize DASH player.");
        }
      } else if (Hls.isSupported()) {
        // Initialize HLS Player
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        
        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          const availableLevels = data.levels.map((l, index) => ({ height: l.height, index }));
          setLevels(availableLevels);
          video.play().catch(() => setIsPlaying(false));
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Network error, recovering...");
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Media error, recovering...");
                hls?.recoverMediaError();
                break;
              default:
                setError("Cannot play this stream.");
                hls?.destroy();
                break;
            }
          }
        });
        
        setHlsInstance(hls);

      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => setIsPlaying(false));
        });
        video.addEventListener('error', () => setError("Stream error."));
      } else {
        setError("Your browser does not support HLS or DASH playback.");
      }
    };

    playStream();

    return () => {
      if (hls) {
        hls.destroy();
      }
      if (dash) {
          dash.reset();
      }
    };
  }, [channel.url]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await containerRef.current?.requestFullscreen();
        // Attempt to lock orientation to landscape on mobile
        if (screen.orientation && 'lock' in screen.orientation) {
            // @ts-ignore
            screen.orientation.lock('landscape').catch(() => {});
        }
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        if (screen.orientation && 'unlock' in screen.orientation) {
            screen.orientation.unlock();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePiP = async () => {
    if (videoRef.current) {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    }
  };

  const handleLevelChange = (levelIndex: number) => {
    setCurrentLevel(levelIndex);
    if (hlsInstance) {
      hlsInstance.currentLevel = levelIndex;
    }
    // DASH quality switching logic can be added here using dashInstance.setQualityFor(...)
    setShowSettings(false);
  };

  const cycleAspectRatio = () => {
    if (aspectRatio === 'contain') setAspectRatio('cover');
    else if (aspectRatio === 'cover') setAspectRatio('fill');
    else setAspectRatio('contain');
  };

  const rotateVideo = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  const getObjectFit = () => {
    if (aspectRatio === 'fill') return 'fill';
    return aspectRatio; // contain or cover
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[60] bg-black flex flex-col justify-center items-center group font-sans overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && !showSettings && setShowControls(false)}
      onClick={() => isPlaying && setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full transition-transform duration-300 ease-in-out"
        style={{ 
            objectFit: getObjectFit(),
            transform: `rotate(${rotation}deg) scale(${rotation % 180 !== 0 ? 1 : 1})`
        }}
        autoPlay
        playsInline
      />

      {/* Loading / Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
          <div className="text-center">
             <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
             <p className="text-white text-lg">{error}</p>
             <button 
               onClick={onClose} 
               className="mt-4 px-6 py-2 bg-white text-black font-bold rounded hover:bg-gray-200"
             >
               Go Back
             </button>
          </div>
        </div>
      )}

      {/* Overlay Controls */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 flex flex-col justify-between ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Top Bar */}
        <div className="p-6 flex justify-between items-start pointer-events-auto">
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition text-white backdrop-blur-sm">
            <ArrowLeft className="w-8 h-8" />
          </button>
          <div className="text-right">
             <h2 className="text-white font-bold text-2xl drop-shadow-md">{channel.name}</h2>
             <div className="flex items-center justify-end gap-2 text-gray-300 text-sm">
                <span className="bg-red-600 px-2 py-0.5 rounded text-white text-xs font-bold">LIVE</span>
                <span>{channel.group}</span>
             </div>
          </div>
        </div>

        {/* Center Play Button (only when paused) */}
        {!isPlaying && (
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-black/50 p-6 rounded-full border border-white/20 backdrop-blur-sm pointer-events-auto cursor-pointer" onClick={togglePlay}>
                <Play className="w-12 h-12 text-white fill-white ml-2" />
              </div>
           </div>
        )}

        {/* Bottom Bar */}
        <div className="p-6 md:p-10 pointer-events-auto">
          <div className="flex flex-col gap-4">
             {/* Progress Bar (Fake for Live) */}
             <div className="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-full animate-pulse"></div>
             </div>

             <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <button onClick={togglePlay} className="text-white hover:text-red-500 transition" title="Play/Pause (Space)">
                      {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
                  </button>
                  
                  <div className="flex items-center gap-2 group/vol">
                    <button onClick={toggleMute} className="text-white hover:text-gray-300 transition" title="Mute (M)">
                      {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.1" 
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 h-1 bg-white rounded-lg appearance-none cursor-pointer" 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   {/* Favorite */}
                   <button 
                      onClick={() => onToggleFavorite(channel)} 
                      className={`transition ${isFavorite ? 'text-red-500' : 'text-white hover:text-gray-300'}`}
                      title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                   >
                      <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                   </button>

                   {/* Quality Settings (HLS Only for now) */}
                   {hlsInstance && (
                     <div className="relative">
                        <button 
                          onClick={() => setShowSettings(!showSettings)} 
                          className={`text-white hover:text-gray-300 transition ${showSettings ? 'rotate-90' : ''}`}
                          title="Quality"
                        >
                           <Settings className="w-6 h-6" />
                        </button>
                        
                        {showSettings && (
                          <div className="absolute bottom-10 right-0 bg-black/90 border border-gray-700 rounded-lg p-2 w-48 backdrop-blur-md">
                             <p className="text-gray-400 text-xs px-2 mb-2 uppercase font-bold">Quality</p>
                             <button 
                               onClick={() => handleLevelChange(-1)}
                               className={`block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-white/20 ${currentLevel === -1 ? 'text-red-500 font-bold' : 'text-white'}`}
                             >
                               Auto
                             </button>
                             {levels.map((level) => (
                               <button 
                                 key={level.index}
                                 onClick={() => handleLevelChange(level.index)}
                                 className={`block w-full text-left px-2 py-1.5 rounded text-sm hover:bg-white/20 ${currentLevel === level.index ? 'text-red-500 font-bold' : 'text-white'}`}
                               >
                                 {level.height}p
                               </button>
                             ))}
                          </div>
                        )}
                     </div>
                   )}

                   {/* Rotation */}
                   <button 
                      onClick={rotateVideo} 
                      className="text-white hover:text-gray-300 transition"
                      title="Rotate Video"
                   >
                      <RotateCw className="w-6 h-6" />
                   </button>

                   {/* Aspect Ratio */}
                   <button 
                      onClick={cycleAspectRatio} 
                      className="text-white hover:text-gray-300 transition relative group/ratio"
                      title="Aspect Ratio"
                   >
                      <Monitor className="w-6 h-6" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/ratio:opacity-100 whitespace-nowrap">
                         {aspectRatio.toUpperCase()}
                      </span>
                   </button>

                   {/* PiP */}
                   {document.pictureInPictureEnabled && (
                     <button onClick={togglePiP} className="text-white hover:text-gray-300 transition" title="Picture in Picture">
                        <PictureInPicture className="w-6 h-6" />
                     </button>
                   )}

                   {/* Fullscreen */}
                   <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition" title="Fullscreen (F)">
                      {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;