import React, { useState, useEffect, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { Board } from './components/Board';
import { InfoPanel } from './components/InfoPanel';
import { findPath } from './services/pathfindingService';
import { CellType, Point, ToolMode } from './types';
import { GRID_ROWS, GRID_COLS, CELL_SIZE_MM } from './constants';

// Initial Grid Generation
const createInitialGrid = (): CellType[][] => {
  const grid: CellType[][] = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    const row: CellType[] = [];
    for (let x = 0; x < GRID_COLS; x++) {
      row.push(CellType.EMPTY);
    }
    grid.push(row);
  }
  return grid;
};

const App: React.FC = () => {
  const [grid, setGrid] = useState<CellType[][]>(createInitialGrid());
  const [tool, setTool] = useState<ToolMode>(ToolMode.SET_START);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [pathResult, setPathResult] = useState<{path: Point[], distance: number}>({ path: [], distance: 0 });

  // Handle cell interactions (click or drag)
  const handleInteraction = useCallback((x: number, y: number) => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      const currentCell = newGrid[y][x];

      // Logic for Start Point
      if (tool === ToolMode.SET_START) {
        // Remove old start
        if (startPoint) {
          newGrid[startPoint.y][startPoint.x] = CellType.EMPTY;
        }
        // If we clicked the end point, clear it
        if (endPoint && endPoint.x === x && endPoint.y === y) {
            setEndPoint(null);
        }
        newGrid[y][x] = CellType.START;
        setStartPoint({ x, y });
        return newGrid;
      }

      // Logic for End Point
      if (tool === ToolMode.SET_END) {
        if (endPoint) {
          newGrid[endPoint.y][endPoint.x] = CellType.EMPTY;
        }
        if (startPoint && startPoint.x === x && startPoint.y === y) {
            setStartPoint(null);
        }
        newGrid[y][x] = CellType.END;
        setEndPoint({ x, y });
        return newGrid;
      }

      // Logic for Drawing/Erasing
      // Don't overwrite Start or End with drawing tools unless erasing
      if ((currentCell === CellType.START || currentCell === CellType.END) && tool !== ToolMode.ERASER) {
        return prevGrid;
      }
      
      if (tool === ToolMode.ERASER) {
         if (currentCell === CellType.START) setStartPoint(null);
         if (currentCell === CellType.END) setEndPoint(null);
         newGrid[y][x] = CellType.EMPTY;
      } else if (tool === ToolMode.DRAW_CONDUCTOR) {
         newGrid[y][x] = CellType.CONDUCTOR;
      } else if (tool === ToolMode.DRAW_SLOT) {
         newGrid[y][x] = CellType.SLOT;
      }

      return newGrid;
    });
  }, [tool, startPoint, endPoint]);

  // Auto-calculate path whenever grid or endpoints change
  useEffect(() => {
    if (startPoint && endPoint) {
      // We need to execute this whenever the grid structure changes or points move
      const result = findPath(grid, startPoint, endPoint);
      if (result) {
        setPathResult({ 
            path: result.path, 
            distance: result.distance * CELL_SIZE_MM 
        });
      } else {
        setPathResult({ path: [], distance: 0 });
      }
    } else {
      setPathResult({ path: [], distance: 0 });
    }
  }, [grid, startPoint, endPoint]);

  const handleClear = () => {
    setGrid(createInitialGrid());
    setStartPoint(null);
    setEndPoint(null);
    setPathResult({ path: [], distance: 0 });
  };

  return (
    <div className="flex flex-col h-screen bg-emerald-950 text-white font-sans overflow-hidden">
      <Toolbar 
        currentTool={tool} 
        setTool={setTool} 
        onClear={handleClear} 
      />
      
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <div className="flex-1 relative bg-emerald-950/30 shadow-inner overflow-hidden flex flex-col">
            {/* Grid Container */}
            <Board 
                grid={grid} 
                path={pathResult.path} 
                currentTool={tool}
                onCellClick={handleInteraction}
                onCellDrag={handleInteraction}
            />
             
            {/* Mobile hint */}
            <div className="md:hidden text-center p-2 text-xs text-emerald-500">
                Scroll or Pinch to Zoom
            </div>
        </div>

        <InfoPanel 
            distance={pathResult.distance} 
            hasPath={pathResult.path.length > 0}
            startSet={!!startPoint}
            endSet={!!endPoint}
        />
      </div>
    </div>
  );
};

export default App;