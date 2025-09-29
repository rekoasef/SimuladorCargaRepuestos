import { PlacedPallet } from "../../lib/types";
import { X, Package, Ruler, Scale, ShieldCheck, ShieldAlert } from "lucide-react"; // <-- CORRECCIÓN AQUÍ

interface SelectionDetailProps {
  selectedPallet: PlacedPallet | null;
  onClose: () => void;
}

export default function SelectionDetail({ selectedPallet, onClose }: SelectionDetailProps) {
  if (!selectedPallet) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg shadow-2xl w-80 p-4 text-white z-10 animate-fade-in">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-cyan-400 flex items-center gap-2">
          <Package size={20} />
          Detalle de la Tarima
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      <div className="space-y-2 text-sm">
        <p className="font-bold text-base truncate" title={selectedPallet.id}>{selectedPallet.id}</p>
        <div className="border-t border-slate-700 my-2"></div>
        <p className="flex items-center gap-2"><Ruler size={16} className="text-slate-400"/> Dimensiones: {selectedPallet.length}m × {selectedPallet.width}m × {selectedPallet.height}m</p>
        <p className="flex items-center gap-2"><Scale size={16} className="text-slate-400"/> Peso: {selectedPallet.weight} kg</p> {/* <-- CORRECCIÓN AQUÍ */}
        <p className="flex items-center gap-2">
          {selectedPallet.isFragile 
            ? <ShieldAlert size={16} className="text-yellow-400"/> 
            : <ShieldCheck size={16} className="text-green-400"/>
          }
          Frágil: {selectedPallet.isFragile ? 'Sí' : 'No'}
        </p>
      </div>
    </div>
  );
}

