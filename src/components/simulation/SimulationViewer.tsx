'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Truck, PlacedPallet, Pallet } from '../../lib/types';
import PalletModel from './PalletModel';
import DimensionHelpers from './DimensionHelpers';
import TruckModel from './TruckModel'; // <-- 1. IMPORTAR EL NUEVO COMPONENTE

interface SimulationResult {
  placedPallets: PlacedPallet[];
  unplacedPallets: Pallet[];
}

interface SimulationViewerProps {
  truck: Truck;
  result: SimulationResult | null;
}

export default function SimulationViewer({ truck, result }: SimulationViewerProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex-grow flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Visualización 3D</h2>
      <div className="flex-grow bg-slate-900/50 rounded-md border-2 border-dashed border-slate-700">
        <Canvas camera={{ position: [truck.width, truck.height, truck.length * 2], fov: 50 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />

          <OrbitControls />

          <Grid
            position={[truck.width / 2, 0, truck.length / 2]}
            args={[truck.width, truck.length]}
            // ... (el resto de las props de Grid se mantienen igual)
            sectionColor="#06B6D4"
            fadeDistance={25}
            infiniteGrid
          />

          {/* <-- 2. AÑADIR EL COMPONENTE DEL CAMIÓN AQUÍ */}
          <TruckModel truck={truck} />

          <DimensionHelpers truck={truck} />

          {result?.placedPallets.map(pallet => (
            <PalletModel key={pallet.id} pallet={pallet} />
          ))}

        </Canvas>
      </div>
    </div>
  );
}