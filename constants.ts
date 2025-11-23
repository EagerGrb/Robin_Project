export const GRID_ROWS = 25;
export const GRID_COLS = 40;
export const CELL_SIZE_MM = 1; // Assume each grid cell is 1mm x 1mm for calculation
export const COST_STRAIGHT = 1.0;
export const COST_DIAGONAL = 1.4142; // Sqrt(2)

// Colors mapping
export const COLORS = {
  EMPTY: 'bg-emerald-900 border-emerald-800', // Soldermask
  SLOT: 'bg-black border-gray-800', // Cutout
  CONDUCTOR: 'bg-amber-600 border-amber-700', // Copper
  START: 'bg-blue-500 border-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.8)]',
  END: 'bg-red-500 border-red-600 shadow-[0_0_10px_rgba(239,68,68,0.8)]',
  PATH: 'bg-yellow-300 animate-pulse', // The creepy path
};