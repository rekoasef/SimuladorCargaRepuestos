import { Truck as TruckIcon } from "lucide-react";
// Cambio aquí:
import { Truck } from "../../lib/types";

interface TransportFormProps {
  truck: Truck;
  setTruck: React.Dispatch<React.SetStateAction<Truck>>;
}

export default function TransportForm({ truck, setTruck }: TransportFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTruck(prevTruck => ({
      ...prevTruck,
      [name]: parseFloat(value) || 0,
    }));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <TruckIcon className="text-cyan-400" />
        1. Detalles del Transporte
      </h2>
      <form className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="width" className="block text-sm font-medium text-slate-300 mb-1">Ancho (m)</label>
          <input type="number" name="width" id="width" value={truck.width} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" />
        </div>
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-slate-300 mb-1">Largo (m)</label>
          <input type="number" name="length" id="length" value={truck.length} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" />
        </div>
        <div>
          <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-1">Alto (m)</label>
          <input type="number" name="height" id="height" value={truck.height} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" />
        </div>
        <div>
          <label htmlFor="maxWeight" className="block text-sm font-medium text-slate-300 mb-1">Peso Máx. (kg)</label>
          <input type="number" name="maxWeight" id="maxWeight" value={truck.maxWeight} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500" />
        </div>
      </form>
    </div>
  );
}