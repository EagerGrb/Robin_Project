import React, { useState, useRef, useEffect } from 'react';
import { CellType, Point, ToolMode } from '../types';
import { COLORS, CELL_SIZE_MM } from '../constants';

interface BoardProps {
  grid: CellType[][];
  path: Point[];
  currentTool: ToolMode;
  onCellClick: (x: number, y: number) => void;
  onCellDrag: (x: number, y: number) => void;
}

// Helper to check if a point is in the path list
const isPathCell = (x: number, y: number, path: Point[]) => {
  return path.some(p => p.x === x && p.y === y);
};

export const Board: React.FC<BoardProps> = ({ grid, path, currentTool, onCellClick, onCellDrag }) => {
  const [isDragging, setIsDragging] = useState(false);
  
  // We use refs to track drag state to avoid closure staleness in event handlers if attached directly
  // However, since we use React Synthetic events on elements, standard state is usually fine.
  
  const handleMouseDown = (x: number, y: number) => {
    setIsDragging(true);
    onCellClick(x, y);
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (isDragging) {
      onCellDrag(x, y);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Global mouse up to catch drags ending outside the grid
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  return (
    <div 
      className="p-6 overflow-auto custom-scrollbar flex justify-center items-start min-h-0"
      style={{ touchAction: 'none' }} // Prevent scrolling while drawing on touch devices
    >
      <div 
        className="grid gap-[1px] bg-emerald-900/30 border border-emerald-800 p-1 rounded shadow-2xl select-none"
        style={{
          gridTemplateColumns: `repeat(${grid[0].length}, 20px)`,
        }}
        onMouseLeave={() => setIsDragging(false)}
      >
        {grid.map((row, y) => (
          row.map((cellType, x) => {
            const isPath = isPathCell(x, y, path);
            // Determine visual style
            let colorClass = COLORS[cellType];
            
            // Path overlay (but don't override Start/End visually entirely)
            if (isPath && cellType !== CellType.START && cellType !== CellType.END) {
               // If it's empty, use path color. If it's conductor, maybe tint it?
               // Usually path goes through empty space.
               colorClass = COLORS.PATH;
            }

            // Interactive Cursor
            let cursor = 'cursor-pointer';
            if (currentTool === ToolMode.SET_START || currentTool === ToolMode.SET_END) cursor = 'cursor-crosshair';
            
            // Additional styling for specific cells
            const isStartOrEnd = cellType === CellType.START || cellType === CellType.END;
            const content = isStartOrEnd ? '' : ''; 
            
            return (
              <div
                key={`${x}-${y}`}
                className={`
                  w-5 h-5 
                  ${colorClass} 
                  ${cursor}
                  hover:opacity-80
                  rounded-[1px]
                  transition-colors duration-75
                  relative
                `}
                onMouseDown={() => handleMouseDown(x, y)}
                onMouseEnter={() => handleMouseEnter(x, y)}
              >
                {/* Optional: Add small dot for grid center or coordinates for debugging */}
                {isPath && !isStartOrEnd && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                    </div>
                )}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
};