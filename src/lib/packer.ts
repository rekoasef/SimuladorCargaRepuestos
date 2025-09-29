import { Truck, Pallet, PlacedPallet } from './types';

// Tipos de estrategias (heurísticas) y el formato del resultado
type Heuristic = 'volume' | 'area' | 'side_long' | 'side_short';

export interface SimulationResult {
  heuristic: Heuristic;
  placedPallets: PlacedPallet[];
  unplacedPallets: Pallet[];
}

// =====================================================================================
// FUNCIÓN PRINCIPAL ORQUESTADORA
// =====================================================================================
export function calculateLoad(truck: Truck, pallets: Pallet[]): SimulationResult[] {
  const heuristics: Heuristic[] = ['volume', 'area', 'side_long', 'side_short'];
  let allResults: SimulationResult[] = [];

  // 1. Separar tarimas por importancia
  const importantPallets = pallets.filter(p => p.isImportant);
  const normalPallets = pallets.filter(p => !p.isImportant);

  // 2. Ejecutar la simulación para cada estrategia
  for (const heuristic of heuristics) {
    const sortedImportant = sortPallets(importantPallets, heuristic);
    const importantResult = pack(truck, sortedImportant, [], 0);

    if (importantResult.unplacedPallets.length > 0) {
      console.warn(`Heurística '${heuristic}' descartada: No se pudieron colocar todas las tarimas prioritarias.`);
      continue;
    }

    const sortedNormal = sortPallets(normalPallets, heuristic);
    const finalResult = pack(truck, sortedNormal, importantResult.placedPallets, importantResult.currentWeight);
    
    allResults.push({
      heuristic,
      ...finalResult,
    });
  }
  
  // 3. Filtrar resultados duplicados y ordenar de mejor a peor
  allResults = filterAndSortResults(allResults);

  return allResults;
}

// =====================================================================================
// LÓGICA DE EMPAQUETADO DINÁMICO
// =====================================================================================
function pack(truck: Truck, palletsToPlace: Pallet[], initialPlaced: PlacedPallet[], initialWeight: number): { placedPallets: PlacedPallet[], unplacedPallets: Pallet[], currentWeight: number } {
  const placedPallets: PlacedPallet[] = [...initialPlaced];
  let pallets = [...palletsToPlace];
  let currentWeight = initialWeight;
  
  while (pallets.length > 0) {
    let bestFit: { pallet: Pallet, position: PlacedPallet, palletIndex: number } | null = null;
    let palletPlacedInIteration = false;

    // Generamos y filtramos los puntos de anclaje en cada iteración
    let anchorPoints = getAnchorPoints(placedPallets);
    anchorPoints = pruneAnchorPoints(anchorPoints, placedPallets, truck);

    for (let i = 0; i < pallets.length; i++) {
      const pallet = pallets[i];
      if (currentWeight + pallet.weight > truck.maxWeight) continue;

      for (const point of anchorPoints) {
        const rotations = getRotations(pallet);
        for (const rotation of rotations) {
          const candidate = { ...pallet, ...rotation, ...point };

          if (isValidPlacement(candidate, truck, placedPallets)) {
            if (bestFit === null || candidate.z < bestFit.position.z || (candidate.z === bestFit.position.z && candidate.y < bestFit.position.y)) {
              bestFit = { pallet, position: candidate, palletIndex: i };
            }
          }
        }
      }
    }

    if (bestFit) {
      const { position, palletIndex } = bestFit;
      placedPallets.push(position);
      currentWeight += position.weight;
      pallets.splice(palletIndex, 1);
      palletPlacedInIteration = true;
    }

    if (!palletPlacedInIteration) break;
  }

  return { placedPallets, unplacedPallets: pallets, currentWeight };
}


// =====================================================================================
// FUNCIONES AUXILIARES
// =====================================================================================
function filterAndSortResults(results: SimulationResult[]): SimulationResult[] {
    const uniqueResults = new Map<string, SimulationResult>();
    for (const result of results) {
        const key = result.placedPallets.map(p => p.id).sort().join(',');
        if (!uniqueResults.has(key) || result.placedPallets.length > uniqueResults.get(key)!.placedPallets.length) {
            uniqueResults.set(key, result);
        }
    }
    const filtered = Array.from(uniqueResults.values());
    filtered.sort((a, b) => b.placedPallets.length - a.placedPallets.length);
    return filtered;
}

function pruneAnchorPoints(points: {x:number, y:number, z:number}[], placed: PlacedPallet[], truck: Truck) {
    return points.filter(p => {
        if (p.x >= truck.width || p.y >= truck.length || p.z >= truck.height) return false;
        for (const item of placed) {
            if (p.x >= item.x && p.x < item.x + item.width &&
                p.y >= item.y && p.y < item.y + item.length &&
                p.z >= item.z && p.z < item.z + item.height) {
                return false;
            }
        }
        return true;
    });
}

function getAnchorPoints(placedPallets: PlacedPallet[]): { x: number, y: number, z: number }[] {
  const points: { x: number, y: number, z: number }[] = [{ x: 0, y: 0, z: 0 }];
  for (const p of placedPallets) {
    points.push({ x: p.x + p.width, y: p.y, z: p.z });
    points.push({ x: p.x, y: p.y + p.length, z: p.z });
    points.push({ x: p.x, y: p.y, z: p.z + p.height });
  }
  return points;
}

function sortPallets(pallets: Pallet[], sortBy: Heuristic): Pallet[] {
  const palletsCopy = [...pallets];
  palletsCopy.sort((a, b) => {
    switch (sortBy) {
      case 'side_long': return Math.max(b.width, b.length) - Math.max(a.width, a.length);
      case 'side_short': return Math.min(b.width, b.length) - Math.min(a.width, a.length);
      case 'area': return (b.width * b.length) - (a.width * a.length);
      case 'volume': default: return (b.width * b.length * b.height) - (a.width * a.length * a.height);
    }
  });
  return palletsCopy;
}

function getRotations(pallet: Pallet): { w: number, l: number, h: number }[] {
  const { width, length, height } = pallet;
  return [
    { w: width, l: length, h: height }, { w: length, l: width, h: height },
    { w: width, l: height, h: length }, { w: height, l: width, h: length },
    { w: length, l: height, h: width }, { w: height, l: length, h: width },
  ];
}

function isValidPlacement(pallet: PlacedPallet, truck: Truck, placedPallets: PlacedPallet[]): boolean {
  if (pallet.x < 0 || pallet.y < 0 || pallet.z < 0) return false;
  if (pallet.x + pallet.width > truck.width + 0.01 || pallet.y + pallet.length > truck.length + 0.01 || pallet.z + pallet.height > truck.height + 0.01) return false;
  for (const other of placedPallets) {
    if (collides(pallet, other)) { return false; }
  }
  if (pallet.z > 0.01) {
    let supportArea = 0;
    for (const other of placedPallets) {
      if (other.isFragile && isDirectlyOnTop(pallet, other)) { return false; }
      supportArea += getOverlapArea(pallet, other);
    }
    if (supportArea / (pallet.width * pallet.length) < 0.75) { return false; }
  }
  return true;
}

function collides(p1: PlacedPallet, p2: PlacedPallet): boolean {
  return (
    p1.x < p2.x + p2.width - 0.01 && p1.x + p1.width > p2.x + 0.01 &&
    p1.y < p2.y + p2.length - 0.01 && p1.y + p1.length > p2.y + 0.01 &&
    p1.z < p2.z + p2.height - 0.01 && p1.z + p1.height > p2.z + 0.01
  );
}

function isDirectlyOnTop(p1: PlacedPallet, p2: PlacedPallet): boolean {
  return Math.abs(p1.z - (p2.z + p2.height)) < 0.01 &&
    p1.x < p2.x + p2.width && p1.x + p1.width > p2.x &&
    p1.y < p2.y + p2.length && p1.y + p1.length > p2.y;
}

function getOverlapArea(p1: PlacedPallet, p2: PlacedPallet): number {
  if (Math.abs(p1.z - (p2.z + p2.height)) > 0.01) return 0;
  const x_overlap = Math.max(0, Math.min(p1.x + p1.width, p2.x + p2.width) - Math.max(p1.x, p2.x));
  const y_overlap = Math.max(0, Math.min(p1.y + p1.length, p2.y + p2.length) - Math.max(p1.y, p2.y));
  return x_overlap * y_overlap;
}

