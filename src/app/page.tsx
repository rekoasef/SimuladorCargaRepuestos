'use client';

import { useState } from "react";
import toast from "react-hot-toast";
import PalletList from "../components/simulation/PalletList";
import TransportForm from "../components/simulation/TransportForm";
import LoadingPlan from "../components/simulation/LoadingPlan";
import SimulationViewer from "../components/simulation/SimulationViewer";
import { Pallet, PlacedPallet, Truck } from "../lib/types";
import { calculateLoad } from '../lib/packer';
import { Rocket, Loader2 } from "lucide-react";

interface SimulationResult {
  placedPallets: PlacedPallet[];
  unplacedPallets: Pallet[];
}

export default function Home() {
  const [truck, setTruck] = useState<Truck>({ width: 2.45, length: 13.6, height: 2.7, maxWeight: 24000 });
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPalletId, setSelectedPalletId] = useState<string | null>(null);

  // --- NUEVO ESTADO PARA LA ANIMACIÓN ---
  // Mantiene el índice de la tarima que se está animando actualmente
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);

  const handleSelectPallet = (id: string | null) => {
    setSelectedPalletId(id);
    if (simulationResult && id) {
      const index = simulationResult.placedPallets.findIndex(p => p.id === id);
      setHighlightedIndex(index);
    } else {
      setHighlightedIndex(null);
    }
  };

  const handleAddPallet = (newPallet: Omit<Pallet, 'id'>) => {
    const palletWithId: Pallet = { ...newPallet, id: `Pedido #${Math.floor(Math.random() * 10000)}` };
    setPallets(prevPallets => [...prevPallets, palletWithId]);
    toast.success('Tarima agregada!');
  };

  const handleRemovePallet = (id: string) => {
    setPallets(prevPallets => prevPallets.filter(p => p.id !== id));
    toast.error('Tarima eliminada.');
  };

  const handleSetPallets = (newPallets: Pallet[]) => {
    setPallets(newPallets);
  };

  const handleSimulation = () => {
    setIsLoading(true);
    setSelectedPalletId(null);
    setHighlightedIndex(null);
    setTimeout(() => {
      const result = calculateLoad(truck, pallets);
      setSimulationResult(result);
      setIsLoading(false);
      toast.success(`Simulación completada! Cargadas: ${result.placedPallets.length}, Sin cargar: ${result.unplacedPallets.length}`);
    }, 500);
  };
  
  const isSimulationDisabled = truck.width <= 0 || truck.length <= 0 || truck.height <= 0 || pallets.length === 0;

  const selectedPalletObject = simulationResult?.placedPallets.find(p => p.id === selectedPalletId) ?? null;

  return (
    <main className="flex flex-col lg:flex-row bg-slate-900 text-white min-h-screen">
      <div className="w-full lg:w-1/3 p-4 md:p-8 flex flex-col gap-8 lg:overflow-y-auto">
        <h1 className="text-3xl font-bold text-cyan-400">Simulador de Carga v1.2</h1>
        <TransportForm truck={truck} setTruck={setTruck} />
        <PalletList 
          pallets={pallets} 
          onAddPallet={handleAddPallet} 
          onRemovePallet={handleRemovePallet} 
          onSetPallets={handleSetPallets}
          selectedPalletId={selectedPalletId}
          onSelectPallet={handleSelectPallet}
        />
        <button
          onClick={handleSimulation}
          disabled={isSimulationDisabled || isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          {isLoading ? ( <><Loader2 className="animate-spin" size={20} />Calculando...</> ) : ( <><Rocket size={20} />GENERAR SIMULACIÓN</> )}
        </button>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col h-screen lg:sticky top-0">
        <SimulationViewer 
          truck={truck} 
          result={simulationResult}
          selectedPalletId={selectedPalletId}
          onSelectPallet={handleSelectPallet}
          onAnimationStep={setHighlightedIndex} // Pasa la función para actualizar el resaltado
          selectedPalletObject={selectedPalletObject}
        />
        <LoadingPlan 
          result={simulationResult}
          selectedPalletId={selectedPalletId}
          onSelectPallet={handleSelectPallet}
          highlightedIndex={highlightedIndex} // Pasa el índice a resaltar
        />
      </div>
    </main>
  );
}

