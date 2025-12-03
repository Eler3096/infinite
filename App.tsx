/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback } from 'react';
import { EditorClip, EditorState, ToolType, ImageFile } from './types';
import VideoPlayer from './components/VideoPlayer';
import Timeline from './components/Timeline';
import ApiKeyDialog from './components/ApiKeyDialog';
import { generateImage, generateCaptions } from './services/geminiService';
import {
  MonitorIcon,
  FilmIcon,
  MusicIcon,
  TextIcon,
  MagicWandIcon,
  SettingsIcon,
  UploadIcon,
  SparklesIcon,
  SunIcon,
  PaletteIcon,
  PlusIcon,
  DownloadIcon,
  ScissorsIcon,
  LayersIcon
} from './components/icons';

const SAMPLE_DURATION = 30; // Seconds for mock timeline

const App: React.FC = () => {
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.MEDIA);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [imagePrompt, setImagePrompt] = useState('');
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isGeneratingCaptions, setIsGeneratingCaptions] = useState(false);
  
  // Editor State
  const [editorState, setEditorState] = useState<EditorState>({
    currentTime: 0,
    duration: 0, // Will be set when video loads
    isPlaying: false,
    selectedClipId: null,
    clips: [],
    zoomLevel: 1,
  });

  // Check for API key
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        try {
          if (!(await window.aistudio.hasSelectedApiKey())) {
            setShowApiKeyDialog(true);
          }
        } catch (error) {
           console.warn('API Key check failed', error);
           setShowApiKeyDialog(true);
        }
      }
    };
    checkApiKey();
  }, []);

  const handleApiKeyContinue = async () => {
     setShowApiKeyDialog(false);
     if (window.aistudio) await window.aistudio.openSelectKey();
  };

  // Video Player Handlers
  const handleTimeUpdate = (time: number) => {
     setEditorState(prev => ({ ...prev, currentTime: time }));
  };

  const handleDurationChange = (duration: number) => {
     setEditorState(prev => ({ ...prev, duration }));
  };

  const handlePlayPause = () => {
     setEditorState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleSeek = (time: number) => {
     setEditorState(prev => ({ ...prev, currentTime: time }));
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        setUploadedFiles(prev => [...prev, url]);
        
        // Auto add to timeline if empty
        if (editorState.clips.length === 0) {
           const newClip: EditorClip = {
              id: Date.now().toString(),
              type: file.type.startsWith('video') ? 'video' : 'image',
              src: url,
              name: file.name,
              duration: 10, // Default duration until metadata loads
              startTime: 0,
              offset: 0
           };
           setEditorState(prev => ({
              ...prev,
              clips: [newClip],
              selectedClipId: newClip.id
           }));
        }
     }
  };

  // Timeline Handlers
  const handleSplit = () => {
     // Mock split functionality
     console.log("Split clip at", editorState.currentTime);
  };

  const handleDelete = () => {
     if (editorState.selectedClipId) {
        setEditorState(prev => ({
           ...prev,
           clips: prev.clips.filter(c => c.id !== prev.selectedClipId),
           selectedClipId: null
        }));
     }
  };

  // AI Generation Handlers
  const handleGenerateImage = async () => {
     if (!imagePrompt.trim()) return;
     setIsGeneratingImg(true);
     try {
        const base64Img = await generateImage(imagePrompt);
        setGeneratedImages(prev => [base64Img, ...prev]);
        setImagePrompt('');
     } catch (e) {
        console.error("Generation failed", e);
        alert("Failed to generate image. Please check your API key and try again.");
     } finally {
        setIsGeneratingImg(false);
     }
  };

  const handleAutoCaptions = async () => {
    const selectedClip = editorState.clips.find(c => c.id === editorState.selectedClipId);
    if (!selectedClip || selectedClip.type !== 'video') {
      alert("Please select a video clip on the timeline to generate captions for.");
      return;
    }

    setIsGeneratingCaptions(true);
    try {
      // Fetch blob from blob URL
      const response = await fetch(selectedClip.src);
      const blob = await response.blob();
      
      const captions = await generateCaptions(blob);
      
      if (captions.length === 0) {
          alert("No speech detected or generation failed.");
          return;
      }

      // Add captions as text clips
      // We need to account for the clip's offset (trim) and startTime on the timeline
      const newClips: EditorClip[] = captions
        .filter(cap => {
          // Filter out captions that fall outside the trimmed video range
          // The visible part of the video source is [offset, offset + duration]
          const clipEndSource = selectedClip.offset + selectedClip.duration;
          // Overlap check: caption starts before clip ends AND caption ends after clip starts
          return cap.startTime < clipEndSource && cap.endTime > selectedClip.offset;
        })
        .map((cap, index) => {
          // Adjust time relative to the timeline start of the clip
          // cap.startTime is relative to source video 0s
          // We need to subtract offset (start of trim) to get time relative to clip start
          const relativeStart = cap.startTime - selectedClip.offset;
          const relativeEnd = cap.endTime - selectedClip.offset;

          // Clamp calculated relative times to be >= 0
          const startInClip = Math.max(0, relativeStart);
          const endInClip = Math.min(selectedClip.duration, relativeEnd);
          
          const duration = endInClip - startInClip;
          
          if (duration <= 0) return null;

          return {
            id: `caption-${Date.now()}-${index}`,
            type: 'text',
            src: '', 
            name: cap.text,
            duration: duration,
            startTime: selectedClip.startTime + startInClip,
            offset: 0
          };
        })
        .filter(Boolean) as EditorClip[];

      if (newClips.length === 0) {
        alert("Captions generated but none fall within the trimmed video segment.");
        return;
      }

      setEditorState(prev => ({
        ...prev,
        clips: [...prev.clips, ...newClips]
      }));

    } catch (e) {
      console.error(e);
      alert("Failed to generate captions. Please try again.");
    } finally {
      setIsGeneratingCaptions(false);
    }
  };

  const addToTimeline = (src: string, type: 'image' | 'video') => {
      const newClip: EditorClip = {
         id: Date.now().toString(),
         type,
         src,
         name: type === 'image' ? 'Generated Image' : 'Video Clip',
         duration: 5,
         startTime: editorState.currentTime,
         offset: 0
      };
      setEditorState(prev => ({
         ...prev,
         clips: [...prev.clips, newClip]
      }));
  };

  // Get active video source for player
  const activeClip = editorState.clips.find(c => 
     editorState.currentTime >= c.startTime && 
     editorState.currentTime < (c.startTime + c.duration) &&
     c.type === 'video'
  );
  // Fallback to first video clip if none active (for simple preview) or the uploaded file
  const playerSrc = activeClip ? activeClip.src : (editorState.clips.find(c => c.type === 'video')?.src || null);

  // Get active text overlays
  const activeCaptions = editorState.clips
    .filter(c => 
        c.type === 'text' && 
        editorState.currentTime >= c.startTime && 
        editorState.currentTime < (c.startTime + c.duration)
    )
    .map(c => c.name);


  return (
    <div className="h-screen w-screen bg-[#0D0D0D] flex flex-col font-sans text-gray-200 overflow-hidden">
      {showApiKeyDialog && <ApiKeyDialog onContinue={handleApiKeyContinue} />}
      
      {/* Header */}
      <header className="h-14 bg-[#121212] border-b border-[#2a2a2a] flex items-center justify-between px-6 z-20">
         <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-transparent">
                ProVideo AI Studio
             </h1>
         </div>
         
         <div className="flex items-center gap-4">
             <div className="text-xs text-gray-500 bg-[#1f1f1f] px-3 py-1.5 rounded-full border border-[#2a2a2a]">
                Draft: Untitled Project
             </div>
             <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                <DownloadIcon className="w-4 h-4" />
                Export
             </button>
         </div>
      </header>

      <div className="flex-grow flex overflow-hidden">
         {/* Left Sidebar - Tools & Assets */}
         <aside className="w-16 bg-[#121212] border-r border-[#2a2a2a] flex flex-col items-center py-4 gap-6 z-10">
            {[
               { id: ToolType.MEDIA, icon: <FilmIcon />, label: 'Media' },
               { id: ToolType.AUDIO, icon: <MusicIcon />, label: 'Audio' },
               { id: ToolType.TEXT, icon: <TextIcon />, label: 'Text' },
               { id: ToolType.AI_GEN, icon: <MagicWandIcon />, label: 'AI Gen' },
               { id: ToolType.FILTERS, icon: <SunIcon />, label: 'Filters' },
               { id: ToolType.ADJUST, icon: <SettingsIcon />, label: 'Adjust' },
            ].map((tool) => (
               <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ToolType)}
                  className={`flex flex-col items-center gap-1 w-full py-2 hover:text-white transition-colors relative
                     ${activeTool === tool.id ? 'text-indigo-400' : 'text-gray-500'}
                  `}
               >
                  <div className="[&>svg]:w-6 [&>svg]:h-6">{tool.icon}</div>
                  <span className="text-[10px] font-medium">{tool.label}</span>
                  {activeTool === tool.id && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500"></div>}
               </button>
            ))}
         </aside>

         {/* Secondary Sidebar - Panel Content */}
         <div className="w-80 bg-[#161616] border-r border-[#2a2a2a] flex flex-col z-10">
             <div className="p-4 border-b border-[#2a2a2a]">
                <h2 className="text-lg font-semibold text-white mb-1">
                   {activeTool === ToolType.MEDIA ? 'Local Media' : 
                    activeTool === ToolType.AI_GEN ? 'AI Generator' : 
                    activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
                </h2>
             </div>
             
             <div className="flex-grow overflow-y-auto custom-scrollbar p-4">
                {activeTool === ToolType.MEDIA && (
                   <div className="flex flex-col gap-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-600 rounded-lg bg-[#1f1f1f] hover:bg-[#252525] cursor-pointer transition-colors group">
                         <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-3 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                            <p className="text-sm text-gray-400">Click to upload video</p>
                         </div>
                         <input type="file" className="hidden" accept="video/*,image/*" onChange={handleFileUpload} />
                      </label>

                      <div className="grid grid-cols-2 gap-2">
                         {uploadedFiles.map((src, idx) => (
                            <div key={idx} className="relative aspect-video bg-black rounded-md overflow-hidden group cursor-pointer border border-[#333] hover:border-indigo-500" onClick={() => addToTimeline(src, 'video')}>
                               <video src={src} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <PlusIcon className="w-6 h-6 text-white" />
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {activeTool === ToolType.AI_GEN && (
                   <div className="flex flex-col gap-6">
                      {/* Image Gen */}
                      <div className="space-y-3">
                         <h3 className="text-sm font-medium text-gray-400">Text to Image</h3>
                         <textarea 
                           className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                           rows={4}
                           placeholder="Describe the image you want to generate..."
                           value={imagePrompt}
                           onChange={(e) => setImagePrompt(e.target.value)}
                         />
                         <button 
                           onClick={handleGenerateImage}
                           disabled={isGeneratingImg || !imagePrompt}
                           className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-50 text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
                         >
                            {isGeneratingImg ? <SparklesIcon className="w-4 h-4 animate-spin" /> : <MagicWandIcon className="w-4 h-4" />}
                            {isGeneratingImg ? 'Dreaming...' : 'Generate Image'}
                         </button>
                      </div>

                      {/* Results */}
                      <div className="grid grid-cols-2 gap-2">
                         {generatedImages.map((src, idx) => (
                            <div key={idx} className="relative aspect-square bg-[#1f1f1f] rounded-lg overflow-hidden group cursor-pointer border border-[#333]" onClick={() => addToTimeline(src, 'image')}>
                               <img src={src} className="w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <PlusIcon className="w-6 h-6 text-white" />
                               </div>
                            </div>
                         ))}
                      </div>
                      
                      {/* Video Tools */}
                      <div className="pt-4 border-t border-[#2a2a2a]">
                         <h3 className="text-sm font-medium text-gray-400 mb-2">AI Video Tools</h3>
                         <div className="space-y-2">
                            <button 
                                onClick={handleAutoCaptions}
                                disabled={isGeneratingCaptions || !editorState.selectedClipId}
                                className="w-full flex items-center justify-between p-3 bg-[#1f1f1f] hover:bg-[#252525] rounded-lg border border-[#2a2a2a] transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-300 group-hover:text-white">Auto Captions</span>
                                    {isGeneratingCaptions && <SparklesIcon className="w-3 h-3 text-indigo-400 animate-spin" />}
                                </div>
                                <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded">PRO</span>
                            </button>

                            {['Upscale Video', 'Remove Background', 'Magic Cut'].map(feat => (
                               <div key={feat} className="flex items-center justify-between p-3 bg-[#1f1f1f] rounded-lg border border-[#2a2a2a] opacity-70 hover:opacity-100 cursor-not-allowed">
                                  <span className="text-xs text-gray-300">{feat}</span>
                                  <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded">PRO</span>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                )}
                
                {/* Placeholders for other tabs */}
                {['audio', 'text', 'filters', 'adjust'].includes(activeTool) && (
                   <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                      <LayersIcon className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-sm">Tools coming soon</p>
                   </div>
                )}
             </div>
         </div>

         {/* Center - Player & Timeline */}
         <div className="flex-grow flex flex-col min-w-0 bg-[#0D0D0D]">
             <VideoPlayer 
               src={playerSrc} 
               currentTime={editorState.currentTime}
               isPlaying={editorState.isPlaying}
               onTimeUpdate={handleTimeUpdate}
               onDurationChange={handleDurationChange}
               onPlayPause={handlePlayPause}
               overlays={activeCaptions}
             />
             
             <Timeline 
                clips={editorState.clips}
                currentTime={editorState.currentTime}
                duration={editorState.duration}
                onSeek={handleSeek}
                selectedClipId={editorState.selectedClipId}
                onSelectClip={(id) => setEditorState(prev => ({ ...prev, selectedClipId: id }))}
                onSplit={handleSplit}
                onDelete={handleDelete}
             />
         </div>

         {/* Right Sidebar - Properties */}
         <div className="w-72 bg-[#121212] border-l border-[#2a2a2a] p-4 flex flex-col z-10">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Properties</h3>
            
            {editorState.selectedClipId ? (
               <div className="space-y-6">
                  {/* Transform */}
                  <div>
                     <div className="flex items-center gap-2 mb-3 text-indigo-400">
                        <MonitorIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Video</span>
                     </div>
                     <div className="space-y-3">
                        <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-400">Scale</span>
                           <span className="text-xs text-gray-500">100%</span>
                        </div>
                        <input type="range" className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        
                        <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-400">Position X</span>
                           <span className="text-xs text-gray-500">0</span>
                        </div>
                        <input type="range" className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                        
                        <div className="flex items-center justify-between">
                           <span className="text-xs text-gray-400">Rotation</span>
                           <span className="text-xs text-gray-500">0°</span>
                        </div>
                        <input type="range" className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                     </div>
                  </div>

                  {/* Adjustment */}
                  <div className="pt-4 border-t border-[#2a2a2a]">
                     <div className="flex items-center gap-2 mb-3 text-indigo-400">
                        <PaletteIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Color & Light</span>
                     </div>
                     <div className="space-y-3">
                         {['Brightness', 'Contrast', 'Saturation', 'Highlight'].map(setting => (
                            <div key={setting}>
                               <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-gray-400">{setting}</span>
                                  <span className="text-xs text-gray-500">0</span>
                               </div>
                               <input type="range" className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            </div>
                         ))}
                     </div>
                  </div>
                  
                  {/* AI Enhancements */}
                  <div className="pt-4 border-t border-[#2a2a2a]">
                     <div className="flex items-center gap-2 mb-3 text-indigo-400">
                        <SparklesIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">AI Enhancements</span>
                     </div>
                     <div className="space-y-2">
                        <label className="flex items-center justify-between p-2 bg-[#1f1f1f] rounded cursor-pointer group hover:bg-[#252525]">
                           <span className="text-xs text-gray-300">Auto Color</span>
                           <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700" />
                        </label>
                        <label className="flex items-center justify-between p-2 bg-[#1f1f1f] rounded cursor-pointer group hover:bg-[#252525]">
                           <span className="text-xs text-gray-300">Remove Noise</span>
                           <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700" />
                        </label>
                        <label className="flex items-center justify-between p-2 bg-[#1f1f1f] rounded cursor-pointer group hover:bg-[#252525]">
                           <span className="text-xs text-gray-300">Face Enhance</span>
                           <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 bg-gray-700" />
                        </label>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-60">
                  <MonitorIcon className="w-12 h-12 mb-3" />
                  <p className="text-sm text-center">Select a clip to view properties</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default App;