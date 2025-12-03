/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import {
  ArrowDown,
  ArrowRight,
  Baseline,
  ChevronDown,
  Film,
  Image,
  KeyRound,
  Layers,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Tv,
  X,
  Play,
  Pause,
  Scissors,
  Trash2,
  Wand2,
  Music,
  Type,
  Maximize,
  Download,
  Settings,
  Undo,
  Redo,
  Upload,
  Sun,
  Palette,
  MonitorPlay,
  Volume2,
  MoreVertical
} from 'lucide-react';

const defaultProps = {
  strokeWidth: 1.5,
};

export const KeyIcon = (props: React.SVGProps<SVGSVGElement>) => <KeyRound {...defaultProps} {...props} />;
export const ArrowPathIcon = (props: React.SVGProps<SVGSVGElement>) => <RefreshCw {...defaultProps} {...props} />;
export const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => <Sparkles {...defaultProps} {...props} />;
export const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <Plus {...defaultProps} {...props} />;
export const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => <ChevronDown {...defaultProps} {...props} />;
export const SlidersHorizontalIcon = (props: React.SVGProps<SVGSVGElement>) => <SlidersHorizontal {...defaultProps} {...props} />;
export const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => <ArrowRight {...defaultProps} {...props} />;
export const RectangleStackIcon = (props: React.SVGProps<SVGSVGElement>) => <Layers {...defaultProps} {...props} />;
export const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => <X {...defaultProps} {...props} />;
export const TextModeIcon = (props: React.SVGProps<SVGSVGElement>) => <Baseline {...defaultProps} {...props} />;
export const FramesModeIcon = (props: React.SVGProps<SVGSVGElement>) => <Image {...defaultProps} {...props} />;
export const ReferencesModeIcon = (props: React.SVGProps<SVGSVGElement>) => <Film {...defaultProps} {...props} />;
export const TvIcon = (props: React.SVGProps<SVGSVGElement>) => <Tv {...defaultProps} {...props} />;
export const FilmIcon = (props: React.SVGProps<SVGSVGElement>) => <Film {...defaultProps} {...props} />;
export const CurvedArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => <ArrowDown {...props} strokeWidth={3} />;

// Editor Icons
export const PlayIcon = (props: React.SVGProps<SVGSVGElement>) => <Play {...defaultProps} {...props} fill="currentColor" />;
export const PauseIcon = (props: React.SVGProps<SVGSVGElement>) => <Pause {...defaultProps} {...props} fill="currentColor" />;
export const ScissorsIcon = (props: React.SVGProps<SVGSVGElement>) => <Scissors {...defaultProps} {...props} />;
export const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <Trash2 {...defaultProps} {...props} />;
export const MagicWandIcon = (props: React.SVGProps<SVGSVGElement>) => <Wand2 {...defaultProps} {...props} />;
export const MusicIcon = (props: React.SVGProps<SVGSVGElement>) => <Music {...defaultProps} {...props} />;
export const TextIcon = (props: React.SVGProps<SVGSVGElement>) => <Type {...defaultProps} {...props} />;
export const MaximizeIcon = (props: React.SVGProps<SVGSVGElement>) => <Maximize {...defaultProps} {...props} />;
export const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => <Download {...defaultProps} {...props} />;
export const SettingsIcon = (props: React.SVGProps<SVGSVGElement>) => <Settings {...defaultProps} {...props} />;
export const UndoIcon = (props: React.SVGProps<SVGSVGElement>) => <Undo {...defaultProps} {...props} />;
export const RedoIcon = (props: React.SVGProps<SVGSVGElement>) => <Redo {...defaultProps} {...props} />;
export const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => <Upload {...defaultProps} {...props} />;
export const SunIcon = (props: React.SVGProps<SVGSVGElement>) => <Sun {...defaultProps} {...props} />;
export const PaletteIcon = (props: React.SVGProps<SVGSVGElement>) => <Palette {...defaultProps} {...props} />;
export const MonitorIcon = (props: React.SVGProps<SVGSVGElement>) => <MonitorPlay {...defaultProps} {...props} />;
export const VolumeIcon = (props: React.SVGProps<SVGSVGElement>) => <Volume2 {...defaultProps} {...props} />;
export const MoreIcon = (props: React.SVGProps<SVGSVGElement>) => <MoreVertical {...defaultProps} {...props} />;
export const LayersIcon = (props: React.SVGProps<SVGSVGElement>) => <Layers {...defaultProps} {...props} />;
