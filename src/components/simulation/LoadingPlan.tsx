import { useRef, useEffect } from 'react';
import { Printer, FileDown, PackageCheck, PackageX } from "lucide-react";
import { PlacedPallet, Pallet } from "../../lib/types";

interface SimulationResult {
  placedPallets: PlacedPallet[];
  unplacedPallets: Pallet[];
}

interface LoadingPlanProps {
  result: SimulationResult | null;
  selectedPalletId: string | null;
  onSelectPallet: (id: string | null) => void;
  highlightedIndex: number | null;
}

export default function LoadingPlan({ result, selectedPalletId, onSelectPallet, highlightedIndex }: LoadingPlanProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const highlightedItemRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    // --- CORRECCIÓN AQUÍ ---
    // Usamos el encadenamiento opcional (?.) para llamar a la función solo si el objeto no es nulo.
    highlightedItemRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [highlightedIndex]);

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col h-2/5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Plan de Carga (Paso a Paso)</h2>
        <div className="flex gap-2">
          <button disabled={!result} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><Printer size={18} /></button>
          <button disabled={!result} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><FileDown size={18} /></button>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-grow">
        {!result ? (
          <div className="text-slate-500"><p>Las instrucciones de carga aparecerán aquí.</p></div>
        ) : (
          <div>
            <h3 className="font-bold text-green-400 flex items-center gap-2 mb-2"><PackageCheck /> Tarimas Cargadas ({result.placedPallets.length})</h3>
            <ol ref={listRef} className="list-decimal list-inside space-y-1 text-slate-300">
              {result.placedPallets.map((p, index) => {
                const isSelected = selectedPalletId === p.id;
                const isHighlighted = highlightedIndex === index;
                return (
                  <li 
                    key={p.id}
                    ref={isHighlighted ? highlightedItemRef : null}
                    onClick={() => onSelectPallet(p.id)}
                    className={`cursor-pointer p-1 rounded-md transition-all duration-200 
                      ${isSelected ? 'bg-cyan-800 scale-105' : ''} 
                      ${isHighlighted && !isSelected ? 'bg-slate-700' : ''}
                      ${!isSelected && !isHighlighted ? 'hover:bg-slate-700/50' : ''}
                    `}
                  >
                    Cargar <strong>{p.id}</strong> en (x: {p.x.toFixed(2)}, y: {p.y.toFixed(2)}, z: {p.z.toFixed(2)})
                  </li>
                );
              })}
            </ol>

            {result.unplacedPallets.length > 0 && (
              <>
                <h3 className="font-bold text-red-400 flex items-center gap-2 mt-4 mb-2"><PackageX /> Tarimas Sin Cargar ({result.unplacedPallets.length})</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {result.unplacedPallets.map(p => (
                    <li key={p.id}> 
                      <strong>{p.id}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

