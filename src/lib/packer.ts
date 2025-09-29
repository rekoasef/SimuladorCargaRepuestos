import { Truck, Pallet, PlacedPallet } from './types';

type Heuristic = 'volume' | 'area' | 'side_long';

export interface SimulationResult {
  heuristic: Heuristic;
  placedPallets: PlacedPallet[];
  unplacedPallets: Pallet[];
}

// =====================================================================================
// FUNCIÓN PRINCIPAL ORQUESTADORA
// =====================================================================================
export function calculateLoad(truck: Truck, pallets: Pallet[]): SimulationResult[] {
  const heuristics: Heuristic[] = ['volume', 'area', 'side_long'];
  const allResults: SimulationResult[] = [];

  const importantPallets = pallets.filter(p => p.isImportant);
  const normalPallets = pallets.filter(p => !p.isImportant);

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
  
  return filterAndSortResults(allResults);
}

// =====================================================================================
// LÓGICA DE EMPAQUETADO "BEST-FIT" DINÁMICO Y SECUENCIAL
// =====================================================================================
function pack(truck: Truck, palletsToPlace: Pallet[], initialPlaced: PlacedPallet[], initialWeight: number): { placedPallets: PlacedPallet[], unplacedPallets: Pallet[], currentWeight: number } {
  const placedPallets: PlacedPallet[] = [...initialPlaced];
  let unplacedPallets = [...palletsToPlace];
  let currentWeight = initialWeight;
  
  while (true) {
    let bestFit: { pallet: Pallet, position: PlacedPallet, palletIndex: number } | null = null;

    const anchorPoints = getAnchorPoints(placedPallets);
    for (let i = 0; i < unplacedPallets.length; i++) {
      const pallet = unplacedPallets[i];
      if (currentWeight + pallet.weight > truck.maxWeight) continue;
      
      for (const point of anchorPoints) {
        const rotations = getRotations(pallet);
        for (const rotation of rotations) {
          const candidate = { ...pallet, ...rotation, ...point };

          if (isValidPlacement(candidate, truck, placedPallets)) {
            // --- LÓGICA DE DECISIÓN CORREGIDA Y DEFINITIVA ---
            if (bestFit === null || 
                candidate.y < bestFit.position.y || // Prioridad 1: Más al fondo (Y más BAJO es el fondo)
               (candidate.y === bestFit.position.y && candidate.z < bestFit.position.z) || // Prioridad 2: Más abajo
               (candidate.y === bestFit.position.y && candidate.z === bestFit.position.z && candidate.x < bestFit.position.x)) { // Prioridad 3: Más a la izquierda
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
      unplacedPallets.splice(palletIndex, 1);
    } else {
      break;
    }
  }

  return { placedPallets, unplacedPallets, currentWeight };
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

