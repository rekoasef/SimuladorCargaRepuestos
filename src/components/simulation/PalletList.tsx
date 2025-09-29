'use client';
import { useState, useRef } from 'react';
import { Package, PackagePlus, Trash2, ShieldCheck, ShieldAlert, FileUp, Eye } from "lucide-react";
import { Pallet } from "../../lib/types";
import Modal from '../ui/Modal';
import AddPalletForm from './AddPalletForm';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface PalletListProps {
  pallets: Pallet[];
  onAddPallet: (newPallet: Omit<Pallet, 'id'>) => void;
  onRemovePallet: (id: string) => void;
  onSetPallets: (newPallets: Pallet[]) => void;
  selectedPalletId: string | null;
  onSelectPallet: (id: string | null) => void;
}

const isNumeric = (value: any): boolean => {
  const strValue = String(value).replace(',', '.');
  return !isNaN(parseFloat(strValue)) && /^-?\d+(\.\d+)?$/.test(strValue);
};

const VISIBLE_PALLET_LIMIT = 10; // Límite de tarimas visibles en la lista principal

export default function PalletList({ pallets, onAddPallet, onRemovePallet, onSetPallets, selectedPalletId, onSelectPallet }: PalletListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const promise = new Promise<Pallet[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary', cellDates: false });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { raw: false }) as any[];

          const importedPallets: Pallet[] = [];
          
          json.forEach((row, index) => {
            const rowNum = index + 2;
            const id = row.ID;
            
            if (!id) { toast.error(`Error en Fila ${rowNum}: Falta el 'ID'.`); return; }
            if (!isNumeric(row.Largo)) { toast.error(`Error en Fila ${rowNum}: El valor de 'Largo' ("${row.Largo}") no es un número válido.`); return; }
            if (!isNumeric(row.Ancho)) { toast.error(`Error en Fila ${rowNum}: El valor de 'Ancho' ("${row.Ancho}") no es un número válido.`); return; }
            if (!isNumeric(row.Alto)) { toast.error(`Error en Fila ${rowNum}: El valor de 'Alto' ("${row.Alto}") no es un número válido.`); return; }
            if (!isNumeric(row.Peso)) { toast.error(`Error en Fila ${rowNum}: El valor de 'Peso' ("${row.Peso}") no es un número válido.`); return; }

            importedPallets.push({
              id: String(id),
              length: parseFloat(String(row.Largo).replace(',', '.')),
              width: parseFloat(String(row.Ancho).replace(',', '.')),
              height: parseFloat(String(row.Alto).replace(',', '.')),
              weight: parseFloat(String(row.Peso).replace(',', '.')),
              isFragile: String(row.Fragil).toUpperCase() === 'SI',
            });
          });

          if (importedPallets.length === 0 && json.length > 0) {
            reject(new Error("No se pudo importar ninguna fila válida. Revise el archivo."));
          } else {
            resolve(importedPallets);
          }

        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });

    toast.promise(promise, {
      loading: 'Procesando archivo Excel...',
      success: (newPallets) => {
        if (newPallets.length > 0) { onSetPallets(newPallets); return `¡Éxito! Se importaron ${newPallets.length} tarimas.`; }
        return "Proceso finalizado. No se importaron filas nuevas.";
      },
      error: (err) => `Error al importar: ${err.message}`,
    });
    
    event.target.value = '';
  };

  const PalletRow = ({ pallet }: { pallet: Pallet }) => {
    const isSelected = selectedPalletId === pallet.id;
    return (
      <div 
        className={`grid grid-cols-[3fr_3fr_2fr_1fr_1fr] gap-4 p-3 items-center cursor-pointer rounded-md transition-colors ${isSelected ? 'bg-cyan-900/50' : 'hover:bg-slate-700/50'}`}
        onClick={() => onSelectPallet(pallet.id)}
      >
        <div className="truncate font-medium" title={pallet.id}>{pallet.id}</div>
        <div className="text-slate-300">{`${pallet.length}×${pallet.width}×${pallet.height}m`}</div>
        <div className="text-slate-300">{`${pallet.weight} kg`}</div>
        <div className="flex justify-center">
          {pallet.isFragile ? <ShieldAlert className="text-yellow-400" size={20} /> : <ShieldCheck className="text-green-400" size={20} />}
        </div>
        <div>
          <button onClick={(e) => { e.stopPropagation(); onRemovePallet(pallet.id); }} className="text-red-500 hover:text-red-400 p-1">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col h-[65vh]">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="text-cyan-400" />
            2. Tarimas a Cargar ({pallets.length})
          </h2>
          <div className='flex gap-2'>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls, .csv" style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
              <FileUp size={20} />
              Importar
            </button>
            <button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors">
              <PackagePlus size={20} />
              Agregar
            </button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-[3fr_3fr_2fr_1fr_1fr] gap-4 text-sm font-bold text-slate-400 p-2 border-b border-slate-700 sticky top-0 bg-slate-800">
            <div>ID</div>
            <div>Dimensiones</div>
            <div>Peso</div>
            <div className="text-center">Frágil</div>
            <div>Acciones</div>
          </div>
          <div className="divide-y divide-slate-700">
            {pallets.length > 0 ? (
              pallets.slice(0, VISIBLE_PALLET_LIMIT).map(pallet => <PalletRow key={pallet.id} pallet={pallet} />)
            ) : (
              <div className="text-center text-slate-500 p-8">
                <p>No hay tarimas agregadas.</p>
                <p>Haz clic en Agregar o Importar para comenzar.</p>
              </div>
            )}
          </div>
        </div>
        {pallets.length > VISIBLE_PALLET_LIMIT && (
          <div className="text-center mt-4 border-t border-slate-700 pt-4">
            <button onClick={() => setIsViewAllModalOpen(true)} className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-2 justify-center w-full">
              <Eye size={18} />
              Visualizar las {pallets.length} tarimas
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Nueva Tarima">
        <AddPalletForm onAddPallet={onAddPallet} onClose={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isViewAllModalOpen} onClose={() => setIsViewAllModalOpen(false)} title={`Todas las Tarimas (${pallets.length})`}>
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-[3fr_3fr_2fr_1fr_1fr] gap-4 text-sm font-bold text-slate-400 p-2 border-b border-slate-700 sticky top-0 bg-slate-800">
            <div>ID</div>
            <div>Dimensiones</div>
            <div>Peso</div>
            <div className="text-center">Frágil</div>
            <div>Acciones</div>
          </div>
          <div className="divide-y divide-slate-700">
            {pallets.map(pallet => <PalletRow key={pallet.id} pallet={pallet} />)}
          </div>
        </div>
      </Modal>
    </>
  );
}

