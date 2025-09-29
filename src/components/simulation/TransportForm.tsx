import { Truck as TruckIcon, ChevronsUpDown } from "lucide-react";
import { Truck } from "../../lib/types";

interface TransportFormProps {
  truck: Truck;
  setTruck: React.Dispatch<React.SetStateAction<Truck>>;
}

// Perfiles preestablecidos de vehículos
const profiles: { name: string, data: Truck }[] = [
  { name: "Personalizado", data: { width: 0, length: 0, height: 0, maxWeight: 0 } },
  { name: "Camión Estándar", data: { width: 2.45, length: 13.6, height: 2.7, maxWeight: 24000 } },
  { name: "Contenedor 40 pies", data: { width: 2.44, length: 12.19, height: 2.59, maxWeight: 28000 } },
  { name: "Furgoneta Grande", data: { width: 1.8, length: 4.2, height: 2.1, maxWeight: 3500 } },
];

export default function TransportForm({ truck, setTruck }: TransportFormProps) {
  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedProfile = profiles.find(p => p.name === e.target.value);
    if (selectedProfile && selectedProfile.name !== "Personalizado") {
      setTruck(selectedProfile.data);
    }
  };

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
      {/* Menú desplegable de perfiles */}
      <div className="mb-4">
        <label htmlFor="profile" className="block text-sm font-medium text-slate-300 mb-1">Cargar Perfil</label>
        <div className="relative">
          <select 
            id="profile"
            onChange={handleProfileChange}
            className="w-full appearance-none bg-slate-700 border border-slate-600 rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
          >
            {profiles.map(p => <option key={p.name}>{p.name}</option>)}
          </select>
          <ChevronsUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
        </div>
      </div>
      {/* Campos de dimensiones */}
      <form className="grid grid-cols-2 gap-4">
        {/* ... (inputs de width, length, height, maxWeight sin cambios) ... */}
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