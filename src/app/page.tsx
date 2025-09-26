'use client';

import { useState } from "react";
import toast from "react-hot-toast";
// Importaciones de componentes y tipos
import PalletList from "../components/simulation/PalletList";
import TransportForm from "../components/simulation/TransportForm";
import LoadingPlan from "../components/simulation/LoadingPlan";
import SimulationViewer from "../components/simulation/SimulationViewer";
import { Pallet, PlacedPallet, Truck } from "../lib/types";
import { calculateLoad } from '../lib/packer';
// Importaciones de iconos
import { Rocket, Loader2 } from "lucide-react";

interface SimulationResult {
  placedPallets: PlacedPallet[];
  unplacedPallets: Pallet[];
}

export default function Home() {
  const [truck, setTruck] = useState<Truck>({ width: 6, length: 4, height: 5, maxWeight: 10000 });
  const [pallets, setPallets] = useState<Pallet[]>([
    { id: 'Pedido #4521', width: 1.2, length: 0.8, height: 1, weight: 150, isFragile: false },
    { id: 'Pedido #3988', width: 1, length: 1, height: 1.2, weight: 200, isFragile: true },
    { id: 'Pedido #7712', width: 2, length: 1.5, height: 1.8, weight: 500, isFragile: false },
    { id: 'Pedido #9011', width: 0.8, length: 0.8, height: 0.9, weight: 120, isFragile: false },
  ]);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPallet = (newPallet: Omit<Pallet, 'id'>) => {
    const palletWithId: Pallet = { ...newPallet, id: `Pedido #${Math.floor(Math.random() * 10000)}` };
    setPallets(prevPallets => [...prevPallets, palletWithId]);
    toast.success('Tarima agregada!');
  };

  const handleRemovePallet = (id: string) => {
    setPallets(prevPallets => prevPallets.filter(p => p.id !== id));
    toast.error('Tarima eliminada.');
  };

  // Nueva función para reemplazar la lista de tarimas desde el import
  const handleSetPallets = (newPallets: Pallet[]) => {
    setPallets(newPallets);
  };

  const handleSimulation = () => {
    setIsLoading(true);
    setTimeout(() => {
      try {
        const result = calculateLoad(truck, pallets);
        setSimulationResult(result);
        toast.success(
          `Simulación completada! Cargadas: ${result.placedPallets.length}, Sin cargar: ${result.unplacedPallets.length}`
        );
      } catch (error) {
        toast.error('Ocurrió un error durante la simulación.');
        console.error("Simulation Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };
  
  const isSimulationDisabled = truck.width <= 0 || truck.length <= 0 || truck.height <= 0 || pallets.length === 0;

  return (
    <main className="bg-slate-900 min-h-screen text-white p-4 md:p-8 flex flex-col lg:flex-row gap-8">
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-cyan-400">Simulador de Carga</h1>
        
        <TransportForm truck={truck} setTruck={setTruck} />
        
        <PalletList 
          pallets={pallets} 
          onAddPallet={handleAddPallet} 
          onRemovePallet={handleRemovePallet} 
          onSetPallets={handleSetPallets}
        />

        <button
          onClick={handleSimulation}
          disabled={isSimulationDisabled || isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Calculando...
            </>
          ) : (
            <>
              <Rocket size={20} />
              GENERAR SIMULACIÓN
            </>
          )}
        </button>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        <SimulationViewer truck={truck} result={simulationResult} />
        <LoadingPlan result={simulationResult} />
      </div>
    </main>
  );
}