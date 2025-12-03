/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useRef } from 'react';
import { EditorClip } from '../types';
import { ScissorsIcon, UndoIcon, RedoIcon, TrashIcon, MonitorIcon } from './icons';

interface TimelineProps {
  clips: EditorClip[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  selectedClipId: string | null;
  onSelectClip: (id: string) => void;
  onSplit: () => void;
  onDelete: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ 
  clips, 
  currentTime, 
  duration, 
  onSeek, 
  selectedClipId, 
  onSelectClip,
  onSplit,
  onDelete
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(1, x / rect.width));
      onSeek(percentage * (duration || 10)); // Default 10s if no duration
    }
  };
  
  // A helper to generate time markers
  const renderTimeMarkers = () => {
     const markers = [];
     const totalSeconds = duration || 60;
     const interval = totalSeconds > 60 ? 10 : 5;
     
     for (let i = 0; i <= totalSeconds; i += interval) {
        markers.push(
           <div key={i} className="flex-shrink-0 relative h-6 w-[100px] border-l border-gray-700 text-[10px] text-gray-500 pl-1 select-none">
              {i}s
           </div>
        );
     }
     return markers;
  };

  const renderClip = (clip: EditorClip) => {
    const width = (clip.duration / (duration || 1)) * 100;
    const left = (clip.startTime / (duration || 1)) * 100;
    
    return (
       <div 
          key={clip.id}
          onClick={(e) => { e.stopPropagation(); onSelectClip(clip.id); }}
          className={`absolute top-1 bottom-1 rounded overflow-hidden cursor-pointer border transition-colors shadow-sm
             ${selectedClipId === clip.id 
                ? 'border-indigo-400 bg-indigo-900/40 z-10' 
                : clip.type === 'text' 
                    ? 'border-amber-700/50 bg-amber-900/30' 
                    : 'border-indigo-800/50 bg-indigo-900/20'}
          `}
          style={{ 
             left: `${left}%`, 
             width: `${width}%` 
          }}
       >
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
             {/* Visual filmstrip representation for video clips */}
             {clip.type === 'video' && (
                <div className="flex w-full opacity-30 pointer-events-none">
                   {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="flex-1 h-full border-r border-indigo-800/30 bg-indigo-950/40"></div>
                   ))}
                </div>
             )}
             <span className={`absolute text-[10px] font-medium truncate px-2 ${clip.type === 'text' ? 'text-amber-200' : 'text-indigo-200'}`}>
                {clip.name}
             </span>
          </div>
       </div>
    );
  };

  return (
    <div className="h-72 bg-[#121212] border-t border-[#2a2a2a] flex flex-col select-none">
       {/* Timeline Toolbar */}
       <div className="h-10 border-b border-[#2a2a2a] flex items-center justify-between px-4 bg-[#161616]">
          <div className="flex items-center gap-4">
             <button className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors" title="Undo">
                <UndoIcon className="w-4 h-4" />
             </button>
             <button className="text-gray-400 hover:text-white disabled:opacity-50 transition-colors" title="Redo">
                <RedoIcon className="w-4 h-4" />
             </button>
             <div className="w-px h-4 bg-gray-700 mx-2"></div>
             <button onClick={onSplit} className="text-gray-400 hover:text-white flex items-center gap-2 hover:bg-[#2a2a2a] px-2 py-1 rounded transition-colors" title="Split">
                <ScissorsIcon className="w-4 h-4" />
                <span className="text-xs">Split</span>
             </button>
             <button onClick={onDelete} className="text-gray-400 hover:text-red-400 flex items-center gap-2 hover:bg-[#2a2a2a] px-2 py-1 rounded transition-colors" title="Delete">
                <TrashIcon className="w-4 h-4" />
                <span className="text-xs">Delete</span>
             </button>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs text-gray-400">
                <MonitorIcon className="w-3 h-3" />
                <span>Auto-snap on</span>
             </div>
             <div className="w-32 bg-[#2a2a2a] h-1 rounded-full relative">
                <div className="absolute left-1/2 w-3 h-3 bg-gray-400 rounded-full top-1/2 -translate-x-1/2 -translate-y-1/2 hover:bg-white cursor-pointer"></div>
             </div>
          </div>
       </div>

       {/* Ruler */}
       <div className="h-8 bg-[#121212] flex overflow-hidden border-b border-[#2a2a2a]">
          {renderTimeMarkers()}
       </div>

       {/* Tracks Area */}
       <div className="flex-grow relative overflow-x-hidden overflow-y-auto custom-scrollbar p-4 bg-[#0A0A0A]" onClick={handleTimelineClick} ref={timelineRef}>
          {/* Playhead */}
          <div 
            className="absolute top-0 bottom-0 w-px bg-white z-20 pointer-events-none shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
          >
             <div className="absolute top-0 -translate-x-1/2 -mt-1 text-indigo-500">
                <svg width="11" height="12" viewBox="0 0 11 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M5.5 0L11 6V12H0V6L5.5 0Z" fill="#6366F1"/>
                </svg>
             </div>
          </div>

          {/* Main Video Track */}
          <div className="h-16 relative mb-1 group">
             <div className="absolute top-0 left-0 text-[9px] text-gray-600 font-bold uppercase tracking-widest pl-1 pointer-events-none">Video Track</div>
             <div className="absolute inset-x-0 top-4 bottom-0 bg-[#151515] rounded border border-gray-800/30">
                {clips.filter(c => c.type === 'video' || c.type === 'image').map(renderClip)}
             </div>
          </div>

          {/* Text/Overlay Track */}
          <div className="h-12 relative mb-1 group mt-2">
             <div className="absolute top-0 left-0 text-[9px] text-gray-600 font-bold uppercase tracking-widest pl-1 pointer-events-none">Text & Overlays</div>
             <div className="absolute inset-x-0 top-4 bottom-0 bg-[#151515] rounded border border-gray-800/30 border-dashed">
                {clips.filter(c => c.type === 'text').map(renderClip)}
             </div>
          </div>

           {/* Audio Track Placeholder */}
           <div className="h-12 relative mb-1 group mt-2">
             <div className="absolute top-0 left-0 text-[9px] text-gray-600 font-bold uppercase tracking-widest pl-1 pointer-events-none">Audio</div>
             <div className="absolute inset-x-0 top-4 bottom-0 bg-[#151515] rounded border border-gray-800/30 border-dashed opacity-50 flex items-center justify-center">
                 <span className="text-[10px] text-gray-700">Drop audio here</span>
             </div>
          </div>

       </div>
    </div>
  );
};

export default Timeline;