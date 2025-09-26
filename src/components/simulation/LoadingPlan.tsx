import { Printer, FileDown, PackageCheck, PackageX } from "lucide-react";
import { PlacedPallet, Pallet } from "../../lib/types";

interface SimulationResult {
  placedPallets: PlacedPallet[];
  unplacedPallets: Pallet[];
}

interface LoadingPlanProps {
  result: SimulationResult | null;
}

export default function LoadingPlan({ result }: LoadingPlanProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg min-h-[250px] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Plan de Carga (Paso a Paso)</h2>
        <div className="flex gap-2">
          <button disabled={!result} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Printer size={18} />
          </button>
          <button disabled={!result} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-3 rounded-md flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <FileDown size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {!result ? (
          <div className="text-slate-500">
            <p>Las instrucciones de carga aparecerán aquí después de generar la simulación.</p>
          </div>
        ) : (
          <div>
            {/* Tarimas cargadas */}
            <h3 className="font-bold text-green-400 flex items-center gap-2 mb-2"><PackageCheck /> Tarimas Cargadas ({result.placedPallets.length})</h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-300">
              {result.placedPallets.map(p => (
                <li key={p.id}>
                  Cargar <strong>{p.id}</strong> en la posición (x: {p.x.toFixed(2)}, y: {p.y.toFixed(2)}, z: {p.z.toFixed(2)})
                </li>
              ))}
            </ol>

            {/* Tarimas sin cargar */}
            {result.unplacedPallets.length > 0 && (
              <>
                <h3 className="font-bold text-red-400 flex items-center gap-2 mt-4 mb-2"><PackageX /> Tarimas Sin Cargar ({result.unplacedPallets.length})</h3>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {result.unplacedPallets.map(p => (
                    <li key={p.id}>
                      <strong>{p.id}</strong> ({p.length}x{p.width}x{p.height}m, {p.weight}kg)
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