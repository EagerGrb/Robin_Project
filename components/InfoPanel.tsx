import React from 'react';
import { COLORS } from '../constants';
import { AlertCircle, CheckCircle2, Ruler } from 'lucide-react';

interface InfoPanelProps {
  distance: number;
  hasPath: boolean;
  startSet: boolean;
  endSet: boolean;
}

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-3 mb-2">
    <div className={`w-5 h-5 rounded border ${color}`}></div>
    <span className="text-emerald-100 text-sm">{label}</span>
  </div>
);

export const InfoPanel: React.FC<InfoPanelProps> = ({ distance, hasPath, startSet, endSet }) => {
  return (
    <div className="w-full md:w-80 bg-emerald-950 border-l border-emerald-800 p-6 flex flex-col gap-6 h-full overflow-y-auto">
      
      {/* Status Card */}
      <div className="bg-emerald-900/40 rounded-xl p-5 border border-emerald-800">
        <h2 className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
          <Ruler size={16} />
          Creepage Result
        </h2>
        
        <div className="flex flex-col items-center justify-center py-4">
           <span className="text-4xl font-mono font-bold text-white mb-1">
             {distance.toFixed(2)}
             <span className="text-lg text-emerald-400 ml-1">mm</span>
           </span>
           <span className="text-xs text-emerald-500">Surface Distance</span>
        </div>

        <div className="mt-4 space-y-2">
          {!startSet && (
            <div className="flex items-center gap-2 text-yellow-500 text-xs bg-yellow-900/20 p-2 rounded">
              <AlertCircle size={14} /> Place Start Point
            </div>
          )}
          {!endSet && (
            <div className="flex items-center gap-2 text-yellow-500 text-xs bg-yellow-900/20 p-2 rounded">
              <AlertCircle size={14} /> Place End Point
            </div>
          )}
          {startSet && endSet && !hasPath && distance === 0 && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 p-2 rounded">
              <AlertCircle size={14} /> No Valid Path Found
            </div>
          )}
          {startSet && endSet && hasPath && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-900/20 p-2 rounded">
              <CheckCircle2 size={14} /> Path Calculated
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div>
        <h3 className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-3">Legend</h3>
        <LegendItem color={COLORS.EMPTY} label="Insulator (PCB)" />
        <LegendItem color={COLORS.CONDUCTOR} label="Copper Trace (Obstacle)" />
        <LegendItem color={COLORS.SLOT} label="Slot / Cutout (Obstacle)" />
        <LegendItem color={COLORS.START} label="Source (Start)" />
        <LegendItem color={COLORS.END} label="Target (End)" />
        <LegendItem color="bg-yellow-300 border-yellow-400" label="Calculated Creepage Path" />
      </div>

      {/* Instructions */}
      <div className="text-xs text-emerald-400/60 leading-relaxed border-t border-emerald-800/50 pt-4">
        <p className="mb-2 font-semibold text-emerald-400">How to use:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Select <strong>Start</strong> and <strong>End</strong> points to define the potential difference.</li>
          <li>Draw <strong>Copper Traces</strong> representing other nets to avoid.</li>
          <li>Draw <strong>Slots</strong> to represent air gaps cut into the board.</li>
          <li>The pathfinding calculates the shortest surface distance (Creepage).</li>
          <li>Drag to paint multiple cells at once.</li>
        </ul>
      </div>

    </div>
  );
};