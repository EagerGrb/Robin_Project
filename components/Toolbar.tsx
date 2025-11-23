import React from 'react';
import { ToolMode } from '../types';
import { 
  MousePointer2, 
  MapPin, 
  Ban, 
  Layers, 
  Eraser,
  Trash2,
  Play
} from 'lucide-react';

interface ToolbarProps {
  currentTool: ToolMode;
  setTool: (tool: ToolMode) => void;
  onClear: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ currentTool, setTool, onClear }) => {
  
  const tools = [
    { id: ToolMode.SET_START, label: 'Start Point', icon: <MapPin className="text-blue-500" /> },
    { id: ToolMode.SET_END, label: 'End Point', icon: <MapPin className="text-red-500" /> },
    { id: ToolMode.DRAW_CONDUCTOR, label: 'Copper Trace', icon: <Layers className="text-amber-500" /> },
    { id: ToolMode.DRAW_SLOT, label: 'Slot/Cutout', icon: <Ban className="text-gray-400" /> },
    { id: ToolMode.ERASER, label: 'Eraser', icon: <Eraser className="text-white" /> },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-emerald-900/50 border-b border-emerald-800 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-1 mr-4">
        <div className="bg-blue-500 p-1.5 rounded-md">
           <MousePointer2 size={20} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-wide text-emerald-100">PCB Creepage</span>
      </div>

      <div className="h-8 w-px bg-emerald-700 mx-2 hidden sm:block"></div>

      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setTool(tool.id)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm
            ${currentTool === tool.id 
              ? 'bg-emerald-700 text-white shadow-lg ring-2 ring-emerald-500 ring-offset-2 ring-offset-emerald-900' 
              : 'bg-emerald-950/50 text-emerald-300 hover:bg-emerald-800 hover:text-white'}
          `}
        >
          {tool.icon}
          <span className="hidden md:inline">{tool.label}</span>
        </button>
      ))}

      <div className="flex-grow"></div>

      <button
        onClick={onClear}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-900/80 text-red-200 hover:bg-red-800 hover:text-white transition-colors text-sm font-semibold border border-red-800"
      >
        <Trash2 size={18} />
        Clear Board
      </button>
    </div>
  );
};