export enum CellType {
  EMPTY = 'EMPTY',       // PCB Substrate (Insulator) - Walkable
  SLOT = 'SLOT',         // Cutout/Slot (Air Gap) - Obstacle
  CONDUCTOR = 'CONDUCTOR', // Copper Trace - Obstacle (in creepage context, usually we avoid other nets)
  START = 'START',       // Source Pad
  END = 'END',           // Target Pad
  PATH = 'PATH'          // Visually marks the calculated path
}

export enum ToolMode {
  SET_START = 'SET_START',
  SET_END = 'SET_END',
  DRAW_SLOT = 'DRAW_SLOT',
  DRAW_CONDUCTOR = 'DRAW_CONDUCTOR',
  ERASER = 'ERASER'
}

export interface Point {
  x: number;
  y: number;
}

export interface GridNode {
  x: number;
  y: number;
  type: CellType;
  isPath: boolean; // Overlay flag for the calculated path
  f: number;
  g: number;
  h: number;
  parent: GridNode | null;
}

export interface PathResult {
  path: Point[];
  distance: number; // Total creepage distance
}