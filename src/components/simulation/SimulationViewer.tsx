'use client';
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Truck, PlacedPallet, Pallet } from '../../lib/types';
import PalletModel from './PalletModel';
import DimensionHelpers from './DimensionHelpers';
import TruckModel from './TruckModel';
import SelectionDetail from './SelectionDetail';
import { Play, Pause, Rewind, FastForward, Bot } from 'lucide-react';

interface SimulationResult {
  placedPallets: PlacedPallet[];
  unplacedPallets: Pallet[];
}

interface SimulationViewerProps {
  truck: Truck;
  result: SimulationResult | null;
  selectedPalletId: string | null;
  onSelectPallet: (id: string | null) => void;
  onAnimationStep: (index: number | null) => void;
  selectedPalletObject: PlacedPallet | null;
}

const speeds = [
  { label: 'x0.5', value: 400 },
  { label: 'x1', value: 200 },
  { label: 'x2', value: 100 },
  { label: 'x4', value: 50 },
];

export default function SimulationViewer({ truck, result, selectedPalletId, onSelectPallet, onAnimationStep, selectedPalletObject }: SimulationViewerProps) {
  const [animationIndex, setAnimationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(speeds[1].value);

  // Lógica del intervalo de la animación
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && result && animationIndex < result.placedPallets.length) {
      interval = setInterval(() => {
        setAnimationIndex(prev => {
          const nextIndex = prev + 1;
          onAnimationStep(nextIndex - 1);
          if (nextIndex >= result.placedPallets.length) {
            setIsPlaying(false);
          }
          return nextIndex;
        });
      }, currentSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSpeed, result, animationIndex, onAnimationStep]);

  // Reiniciar la animación cuando hay un nuevo resultado
  useEffect(() => {
    setAnimationIndex(result ? result.placedPallets.length : 0);
    setIsPlaying(false);
    onAnimationStep(null);
  }, [result, onAnimationStep]);

  const handlePlayPause = () => {
    if (result && animationIndex >= result.placedPallets.length) {
      setAnimationIndex(0);
      onAnimationStep(null);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setAnimationIndex(0);
    setIsPlaying(false);
    onAnimationStep(null);
  };
  
  const handleSkipToEnd = () => {
    if(result) setAnimationIndex(result.placedPallets.length);
    setIsPlaying(false);
  }

  const handleSpeedChange = () => {
    const currentIndex = speeds.findIndex(s => s.value === currentSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setCurrentSpeed(speeds[nextIndex].value);
  };
  
  const visiblePallets = result ? result.placedPallets.slice(0, animationIndex) : [];

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex-grow flex flex-col relative h-3/5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Visualización 3D</h2>
        {/* Controles de la Animación */}
        {result && result.placedPallets.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-700 p-1 rounded-lg">
            <button onClick={handleReset} title="Reiniciar" className="p-2 hover:bg-slate-600 rounded-md"><Rewind size={18} /></button>
            <button onClick={handlePlayPause} title={isPlaying ? "Pausar" : "Reproducir"} className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-md">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button onClick={handleSkipToEnd} title="Saltar al final" className="p-2 hover:bg-slate-600 rounded-md"><FastForward size={18} /></button>
            <button onClick={handleSpeedChange} title={`Velocidad: ${speeds.find(s=>s.value === currentSpeed)?.label}`} className="p-2 hover:bg-slate-600 rounded-md w-16 text-center font-semibold">
              {speeds.find(s => s.value === currentSpeed)?.label}
            </button>
          </div>
        )}
      </div>
      <div className="flex-grow bg-slate-900/50 rounded-md border-2 border-dashed border-slate-700 relative">
        <Canvas onClick={() => onSelectPallet(null)} camera={{ position: [truck.width, truck.height, truck.length * 2], fov: 50 }}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[10, 10, 5]} intensity={2} />
          <OrbitControls />
          <Grid position={[truck.width / 2, 0, truck.length / 2]} args={[truck.width, truck.length]} sectionColor="#06B6D4" fadeDistance={25} infiniteGrid />
          <TruckModel truck={truck} />
          <DimensionHelpers truck={truck} />
          {visiblePallets.map(pallet => (
            <PalletModel key={pallet.id} pallet={pallet} isSelected={selectedPalletId === pallet.id} onSelect={onSelectPallet} />
          ))}
        </Canvas>
        <SelectionDetail selectedPallet={selectedPalletObject} onClose={() => onSelectPallet(null)} />
      </div>
    </div>
  );
}

