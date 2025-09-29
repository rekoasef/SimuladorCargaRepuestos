'use client';

import { useState } from "react";
import toast from "react-hot-toast";
import PalletList from "../components/simulation/PalletList";
import TransportForm from "../components/simulation/TransportForm";
import LoadingPlan from "../components/simulation/LoadingPlan";
import SimulationViewer from "../components/simulation/SimulationViewer";
import { Pallet, PlacedPallet, Truck } from "../lib/types";
import { calculateLoad, SimulationResult } from '../lib/packer';
import { Rocket, Loader2 } from "lucide-react";
import ResultSelector from "../components/simulation/ResultSelector";

export default function Home() {
  const [truck, setTruck] = useState<Truck>({ width: 2.45, length: 13.6, height: 2.7, maxWeight: 24000 });
  const [pallets, setPallets] = useState<Pallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPalletId, setSelectedPalletId] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSelectPallet = (id: string | null) => {
    setSelectedPalletId(id);
    const activeResult = simulationResults.length > 0 ? simulationResults[activeIndex] : null;
    if (activeResult && id) {
      const index = activeResult.placedPallets.findIndex(p => p.id === id);
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
    setSimulationResults([]);
    setActiveIndex(0);
    setTimeout(() => {
      const results = calculateLoad(truck, pallets);
      
      if (results.length === 0) {
        toast.error("No se generó ninguna carga válida. Es posible que una tarima prioritaria no quepa.", { duration: 5000 });
      } else {
        setSimulationResults(results);
        toast.success(`Se generaron ${results.length} opciones de carga optimizadas.`);
      }

      setIsLoading(false);
    }, 500);
  };
  
  const isSimulationDisabled = truck.width <= 0 || truck.length <= 0 || truck.height <= 0 || pallets.length === 0;

  const activeResult = simulationResults.length > 0 ? simulationResults[activeIndex] : null;
  const selectedPalletObject = activeResult?.placedPallets.find(p => p.id === selectedPalletId) ?? null;

  return (
    <main className="flex flex-col lg:flex-row bg-slate-900 text-white min-h-screen">
      <div className="w-full lg:w-1/3 p-4 md:p-8 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-cyan-400">Simulador de Carga v1.6</h1>
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
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed sticky bottom-4 lg:static"
        >
          {isLoading ? ( <><Loader2 className="animate-spin" size={20} />Calculando...</> ) : ( <><Rocket size={20} />GENERAR SIMULACIÓN</> )}
        </button>
      </div>

      <div className="w-full lg:w-2/3 p-4 md:p-8 flex flex-col gap-8">
        <ResultSelector results={simulationResults} activeIndex={activeIndex} onSelect={setActiveIndex} />
        <SimulationViewer 
          truck={truck} 
          result={activeResult}
          selectedPalletId={selectedPalletId}
          onSelectPallet={handleSelectPallet}
          onAnimationStep={setHighlightedIndex}
          selectedPalletObject={selectedPalletObject}
        />
        <LoadingPlan 
          result={activeResult}
          selectedPalletId={selectedPalletId}
          onSelectPallet={handleSelectPallet}
          highlightedIndex={highlightedIndex}
        />
      </div>
    </main>
  );
}

