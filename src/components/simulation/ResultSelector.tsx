import { SimulationResult } from "../../lib/packer";
import { BrainCircuit, PackageCheck, PackageX } from "lucide-react";

interface ResultSelectorProps {
  results: SimulationResult[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const heuristicNames: Record<string, string> = {
  'volume': 'Por Volumen',
  'area': 'Por Área Base',
  'side_long': 'Por Lado Largo',
  'side_short': 'Por Lado Corto',
}

export default function ResultSelector({ results, activeIndex, onSelect }: ResultSelectorProps) {
  if (results.length === 0) return null;

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-3 text-cyan-400 flex items-center gap-2"><BrainCircuit size={20}/> Opciones de Carga Generadas</h3>
      <div className="flex flex-wrap gap-2">
        {results.map((result, index) => (
          <button
            key={index}
            onClick={() => onSelect(index)}
            className={`p-3 rounded-md text-left transition-colors text-sm
              ${activeIndex === index ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}
            `}
          >
            <p className="font-bold">Opción {index + 1}: <span className="font-normal text-xs">({heuristicNames[result.heuristic]})</span></p>
            <div className="flex gap-4 mt-1">
              <span className="flex items-center gap-1"><PackageCheck size={16} className="text-green-400"/> {result.placedPallets.length}</span>
              <span className="flex items-center gap-1"><PackageX size={16} className="text-red-400"/> {result.unplacedPallets.length}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
