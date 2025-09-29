export interface Truck {
  width: number;
  length: number;
  height: number;
  maxWeight: number;
}

export interface Pallet {
  id: string;
  width: number;
  length: number;
  height: number;
  weight: number;
  isFragile: boolean;
  isImportant: boolean;
}

// AÑADE ESTA NUEVA INTERFAZ
export interface PlacedPallet extends Pallet {
  x: number;
  y: number;
  z: number;
}