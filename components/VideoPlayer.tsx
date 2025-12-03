/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef, useEffect, useState } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  MaximizeIcon, 
  VolumeIcon, 
  ArrowPathIcon 
} from './icons';

interface VideoPlayerProps {
  src: string | null;
  currentTime: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayPause: () => void;
  overlays?: string[];
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  currentTime, 
  isPlaying, 
  onTimeUpdate, 
  onDurationChange,
  onPlayPause,
  overlays = []
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.error("Play failed", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.5) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      onDurationChange(videoRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
  };

  const handleFullScreen = () => {
    if (videoRef.current) {
      videoRef.current.requestFullscreen();
    }
  };

  if (!src) {
    return (
      <div className="flex-grow bg-[#161616] flex items-center justify-center border border-[#2a2a2a] rounded-lg m-4 relative overflow-hidden group">
         <div className="text-center">
            <div className="w-20 h-20 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-[#333] transition-colors">
               <ArrowPathIcon className="w-8 h-8 text-gray-500 animate-spin-slow" />
            </div>
            <p className="text-gray-500 font-medium">Select or upload a video to start editing</p>
         </div>
         {/* Grid background effect */}
         <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </div>
    );
  }

  return (
    <div className="flex-grow bg-[#161616] flex flex-col p-4 gap-4">
       {/* Video Canvas Area */}
       <div className="relative flex-grow bg-black rounded-lg overflow-hidden flex items-center justify-center shadow-2xl border border-[#2a2a2a]">
          <video 
            ref={videoRef}
            src={src}
            className="max-w-full max-h-full"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onClick={onPlayPause}
          />
          
          {/* Text Overlays / Captions */}
          {overlays.length > 0 && (
             <div className="absolute bottom-12 left-8 right-8 text-center pointer-events-none z-10">
                {overlays.map((text, idx) => (
                   <span key={idx} className="inline-block bg-black/60 text-white px-4 py-2 rounded-lg text-lg sm:text-xl font-medium shadow-lg backdrop-blur-sm mx-auto">
                      {text}
                   </span>
                ))}
             </div>
          )}
       </div>

       {/* Controls Bar */}
       <div className="h-12 flex items-center justify-between px-2">
          <div className="flex items-center gap-2 w-1/3">
             <span className="text-xs text-indigo-400 font-mono">{formatTime(currentTime)}</span>
             <span className="text-xs text-gray-500">/</span>
             <span className="text-xs text-gray-400 font-mono">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-6 justify-center w-1/3">
             <button className="text-gray-400 hover:text-white transition-colors">
                <ArrowPathIcon className="w-4 h-4" />
             </button>
             <button 
                onClick={onPlayPause}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
             >
                {isPlaying ? <PauseIcon className="w-5 h-5 fill-current" /> : <PlayIcon className="w-5 h-5 fill-current ml-0.5" />}
             </button>
          </div>

          <div className="flex items-center justify-end gap-4 w-1/3">
             <button className="text-gray-400 hover:text-white">
                <VolumeIcon className="w-5 h-5" />
             </button>
             <button onClick={handleFullScreen} className="text-gray-400 hover:text-white">
                <MaximizeIcon className="w-4 h-4" />
             </button>
          </div>
       </div>
    </div>
  );
};

export default VideoPlayer;