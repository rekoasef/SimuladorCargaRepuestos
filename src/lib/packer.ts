import { Truck, Pallet, PlacedPallet } from './types';

// =====================================================================================
// FUNCIÓN PRINCIPAL ORQUESTADORA (Ahora simplificada)
// =====================================================================================
export function calculateLoad(truck: Truck, pallets: Pallet[]): { placedPallets: PlacedPallet[], unplacedPallets: Pallet[] } {
  console.log("Running Dynamic Best-Fit Packer v5...");
  // Ya no necesitamos múltiples heurísticas, el nuevo algoritmo es inherentemente más inteligente.
  // Simplemente ordenamos por volumen una vez como punto de partida.
  const sortedPallets = sortPallets(pallets, 'volume');
  const result = pack(truck, sortedPallets);
  console.log(`Best result found: Placed ${result.placedPallets.length} pallets.`);
  return result;
}

// =====================================================================================
// NUEVA LÓGICA DE EMPAQUETADO DINÁMICO
// =====================================================================================
function pack(truck: Truck, pallets: Pallet[]): { placedPallets: PlacedPallet[], unplacedPallets: Pallet[] } {
  const placedPallets: PlacedPallet[] = [];
  let unplacedPallets: Pallet[] = [...pallets];
  let currentWeight = 0;
  
  let anchorPoints = [{ x: 0, y: 0, z: 0 }];

  // El bucle principal se ejecuta mientras podamos seguir colocando tarimas
  while (unplacedPallets.length > 0) {
    let bestFit: { pallet: Pallet, position: PlacedPallet, palletIndex: number } | null = null;
    let palletPlacedInIteration = false;

    // 1. En CADA iteración, probamos TODAS las tarimas restantes
    for (let i = 0; i < unplacedPallets.length; i++) {
      const pallet = unplacedPallets[i];
      if (currentWeight + pallet.weight > truck.maxWeight) continue;

      // 2. Para cada tarima, probamos todos los puntos y rotaciones
      for (const point of anchorPoints) {
        const rotations = getRotations(pallet);
        for (const rotation of rotations) {
          const candidate: PlacedPallet = {
            ...pallet,
            width: rotation.w, length: rotation.l, height: rotation.h,
            x: point.x, y: point.y, z: point.z,
          };

          if (isValidPlacement(candidate, truck, placedPallets)) {
            // 3. Si encontramos una posición válida, la guardamos como la "mejor" hasta ahora
            // si cumple con los criterios (más abajo, más al fondo, etc.)
            if (bestFit === null || 
                candidate.z < bestFit.position.z ||
               (candidate.z === bestFit.position.z && candidate.y < bestFit.position.y) ||
               (candidate.z === bestFit.position.z && candidate.y === bestFit.position.y && candidate.x < bestFit.position.x)) {
              bestFit = { pallet, position: candidate, palletIndex: i };
            }
          }
        }
      }
    }

    // 4. Después de probar todo, si encontramos un "mejor ajuste", lo colocamos
    if (bestFit) {
      const { position, palletIndex } = bestFit;
      placedPallets.push(position);
      currentWeight += position.weight;
      
      // Añadimos las nuevas esquinas como posibles puntos de anclaje
      anchorPoints.push({ x: position.x + position.width, y: position.y, z: position.z });
      anchorPoints.push({ x: position.x, y: position.y + position.length, z: position.z });
      anchorPoints.push({ x: position.x, y: position.y, z: position.z + position.height });

      // Eliminamos la tarima colocada de la lista de pendientes
      unplacedPallets.splice(palletIndex, 1);
      palletPlacedInIteration = true;
    }

    // Si en una iteración completa no pudimos colocar ninguna tarima, paramos.
    if (!palletPlacedInIteration) {
      break;
    }
  }

  return { placedPallets, unplacedPallets };
}


// =====================================================================================
// FUNCIONES AUXILIARES (Sin cambios, pero incluidas para que el archivo esté completo)
// =====================================================================================
function sortPallets(pallets: Pallet[], sortBy: 'volume' | 'area' | 'side'): Pallet[] {
  const palletsCopy = [...pallets];
  palletsCopy.sort((a, b) => {
    switch (sortBy) {
      case 'side': return Math.max(b.width, b.length, b.height) - Math.max(a.width, a.length, a.height);
      case 'area': return (b.width * b.length) - (a.width * a.length);
      case 'volume': default: return (b.width * b.length * b.height) - (a.width * a.length * a.height);
    }
  });
  return palletsCopy;
}

function getRotations(pallet: Pallet): { w: number, l: number, h: number }[] {
  const { width, length, height } = pallet;
  // Optimizacion: si las dimensiones son iguales, no generar rotaciones duplicadas
  const uniqueRotations = new Set<string>();
  const rotations: { w: number, l: number, h: number }[] = [];
  const dims = [width, length, height];
  
  // Generar todas las permutaciones
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === j) continue;
      for (let k = 0; k < 3; k++) {
        if (k === i || k === j) continue;
        const rot = [dims[i], dims[j], dims[k]].join(',');
        if (!uniqueRotations.has(rot)) {
          uniqueRotations.add(rot);
          rotations.push({ w: dims[i], l: dims[j], h: dims[k] });
        }
      }
    }
  }
  return rotations.length > 0 ? rotations : [{ w: width, l: length, h: height }];
}


function isValidPlacement(pallet: PlacedPallet, truck: Truck, placedPallets: PlacedPallet[]): boolean {
  if (pallet.x < 0 || pallet.y < 0 || pallet.z < 0) return false;
  if (pallet.x + pallet.width > truck.width + 0.01 || pallet.y + pallet.length > truck.length + 0.01 || pallet.z + pallet.height > truck.height + 0.01) {
    return false;
  }
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

