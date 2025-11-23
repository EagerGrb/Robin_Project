import { GridNode, CellType, Point, PathResult } from '../types';
import { COST_STRAIGHT, COST_DIAGONAL } from '../constants';

/**
 * ============================================================================
 * A* (A-Star) 寻路算法教程版
 * ============================================================================
 * 
 * 核心公式: F = G + H
 * 
 * - G (Ground Cost): 起点走到当前格子的"实际代价"。
 * - H (Heuristic):   当前格子走到终点的"预估代价" (猜测值)。
 * - F (Final Score): G + H。F值越小，代表这条路径越有可能是最短路径。
 */

// 1. 启发函数 (Heuristic)
// 这里的 H 使用"欧几里得距离" (Euclidean Distance)，也就是两点间的直线距离。
// 作用：告诉算法"大概还差多远"，引导算法优先往终点方向搜索，而不是盲目向四周扩散。
const heuristic = (a: GridNode, b: GridNode): number => {
  const dx = Math.abs(a.x - b.x);
  const dy = Math.abs(a.y - b.y);
  return Math.sqrt(dx * dx + dy * dy);
};

// 2. 可行走判断
// 在爬电距离计算中，什么地方能走？
// - SLOT (挖槽): 是空气，不能导电，视为墙壁。
// - CONDUCTOR (铜皮): 是其他网络，碰到会短路，视为障碍物。
const isWalkable = (type: CellType): boolean => {
  return type !== CellType.SLOT && type !== CellType.CONDUCTOR;
};

export const findPath = (
  gridState: CellType[][],
  start: Point,
  end: Point
): PathResult | null => {
  const rows = gridState.length;
  const cols = gridState[0].length;

  // --- 初始化阶段 ---
  
  // 创建网格节点对象矩阵
  // 我们需要为每个格子存储 G, H, F 值以及它的"父节点"(Parent，用于回溯路径)
  const nodes: GridNode[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: GridNode[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        x,
        y,
        type: gridState[y][x],
        isPath: false,
        f: 0,
        g: 0,
        h: 0,
        parent: null,
      });
    }
    nodes.push(row);
  }

  const startNode = nodes[start.y][start.x];
  const endNode = nodes[end.y][end.x];

  // OpenSet: "待检查列表"。存放了我们发现但还没完全探索的格子。
  const openSet: GridNode[] = [startNode];
  
  // ClosedSet: "已检查列表"。存放了我们已经计算过最优路径的格子，不需要再看了。
  // 使用 Set<string> 存储坐标字符串 "x,y" 来快速查找。
  const closedSet = new Set<string>();

  // 初始化起点
  startNode.g = 0;
  startNode.h = heuristic(startNode, endNode);
  startNode.f = startNode.h; // 起点的总分完全取决于预估距离

  // --- 循环搜索阶段 ---
  
  while (openSet.length > 0) {
    // 1. 从 OpenSet 中找出 F 值最小的节点
    // 也就是目前看来"最划算"的一步。
    let lowInd = 0;
    for (let i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowInd].f) {
        lowInd = i;
      }
    }
    const current = openSet[lowInd];

    // 2. 检查是否到达终点
    if (current.x === endNode.x && current.y === endNode.y) {
      // --- 回溯路径阶段 ---
      // 从终点顺着 parent 指针一直往回找，直到起点
      const path: Point[] = [];
      let temp: GridNode | null = current;
      let totalDistance = 0;

      while (temp?.parent) {
        path.push({ x: temp.x, y: temp.y });
        
        // 计算这一步的具体物理距离 (1mm 或 1.414mm)
        const dx = Math.abs(temp.x - temp.parent.x);
        const dy = Math.abs(temp.y - temp.parent.y);
        totalDistance += (dx === 1 && dy === 1) ? COST_DIAGONAL : COST_STRAIGHT;

        temp = temp.parent;
      }
      // 别忘了加上起点
      path.push({ x: startNode.x, y: startNode.y });
      
      // 现在的 path 是 终点 -> 起点，我们需要反转它
      return { path: path.reverse(), distance: totalDistance };
    }

    // 3. 把当前节点从 OpenSet 移到 ClosedSet
    // 表示"这个格子我已经考虑完了"
    openSet.splice(lowInd, 1);
    closedSet.add(`${current.x},${current.y}`);

    // 4. 探索邻居 (周围8个方向)
    for (let yMod = -1; yMod <= 1; yMod++) {
      for (let xMod = -1; xMod <= 1; xMod++) {
        if (xMod === 0 && yMod === 0) continue; // 跳过自己

        const checkX = current.x + xMod;
        const checkY = current.y + yMod;

        // 越界检查
        if (checkX >= 0 && checkX < cols && checkY >= 0 && checkY < rows) {
          const neighbor = nodes[checkY][checkX];

          // 如果邻居已经在 ClosedSet (已检查过)，直接跳过
          if (closedSet.has(`${checkX},${checkY}`)) continue;

          // 障碍物检查
          // 特殊情况：如果邻居是终点，即使它被标记为障碍物（比如导体），我们也允许连上去（因为我们要测到导体的距离）
          const isDestination = (checkX === endNode.x && checkY === endNode.y);
          if (!isWalkable(neighbor.type) && !isDestination) continue;

          // --- 拐角限制 (Corner Cutting) ---
          // 这是一个物理细节：虽然 (0,0) 到 (1,1) 是对角线相邻，
          // 但如果 (0,1) 和 (1,0) 都是墙，物理上你不能从墙缝里挤过去。
          if (Math.abs(xMod) === 1 && Math.abs(yMod) === 1) {
             const nodeA = nodes[current.y][checkX]; // 水平方向的邻居
             const nodeB = nodes[checkY][current.x]; // 垂直方向的邻居
             
             // 如果两个直角邻居都阻挡，则不能走对角线
             const isBlockA = !isWalkable(nodeA.type) && !(nodeA.x === endNode.x && nodeA.y === endNode.y);
             const isBlockB = !isWalkable(nodeB.type) && !(nodeB.x === endNode.x && nodeB.y === endNode.y);

             if (isBlockA && isBlockB) continue;
          }

          // 5. 计算 G 值 (从起点走到邻居的距离)
          const moveCost = (Math.abs(xMod) === 1 && Math.abs(yMod) === 1) ? COST_DIAGONAL : COST_STRAIGHT;
          const tentativeG = current.g + moveCost;

          // 检查邻居是否已经在 OpenSet 中
          let inOpenSet = false;
          for(const node of openSet) {
            if(node.x === neighbor.x && node.y === neighbor.y) {
              inOpenSet = true;
              break;
            }
          }

          // 6. 更新邻居数据
          // 如果是一条新路 (不在OpenSet)，或者这是一条更近的路 (tentativeG < neighbor.g)
          if (!inOpenSet || tentativeG < neighbor.g) {
            neighbor.parent = current;     // 认贼作父...啊不，认当前节点为父节点
            neighbor.g = tentativeG;       // 更新实际代价
            neighbor.h = heuristic(neighbor, endNode); // 计算预估代价
            neighbor.f = neighbor.g + neighbor.h;      // 更新总分

            if (!inOpenSet) {
              openSet.push(neighbor); // 加入待检查列表
            }
          }
        }
      }
    }
  }

  // 这里的 null 表示 OpenSet 空了也没找到终点，说明无路可走
  return null;
};