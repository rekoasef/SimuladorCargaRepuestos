'use client';
import { useState, useRef } from 'react';
import { Package, PackagePlus, Trash2, ShieldCheck, ShieldAlert, FileUp, Eye, Star } from "lucide-react";
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

const VISIBLE_PALLET_LIMIT = 10;

const isNumeric = (value: any): boolean => {
  if (value === null || value === undefined || String(value).trim() === '') return false;
  const strValue = String(value).replace(',', '.');
  return !isNaN(parseFloat(strValue)) && isFinite(Number(strValue));
};

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
          // @ts-ignore
          for (const [index, row] of json.entries()) {
            const rowNum = index + 2;
            
            // --- LÓGICA DE IMPORTACIÓN MEJORADA ---
            // Normaliza los nombres de las claves (encabezados)
            const normalizedRow: {[key: string]: any} = {};
            for (const key in row) {
              normalizedRow[key.trim().toLowerCase()] = row[key];
            }

            const id = normalizedRow['id'];
            const length = normalizedRow['largo'];
            const width = normalizedRow['ancho'];
            const height = normalizedRow['alto'];
            const weight = normalizedRow['peso'];
            const isFragile = normalizedRow['fragil'];
            const isImportant = normalizedRow['importancia'];

            if (!id || length === undefined || width === undefined || height === undefined || weight === undefined) {
              toast.error(`Error en Fila ${rowNum}: Faltan columnas requeridas (ID, Largo, Ancho, Alto, Peso).`);
              continue;
            }
            if (!isNumeric(length) || !isNumeric(width) || !isNumeric(height) || !isNumeric(weight)) {
              toast.error(`Error en Fila ${rowNum}: Una de las medidas o el peso no es un número válido.`);
              continue;
            }

            importedPallets.push({
              id: String(id),
              length: parseFloat(String(length).replace(',', '.')),
              width: parseFloat(String(width).replace(',', '.')),
              height: parseFloat(String(height).replace(',', '.')),
              weight: parseFloat(String(weight).replace(',', '.')),
              isFragile: String(isFragile).toUpperCase() === 'SI',
              isImportant: String(isImportant).toUpperCase() === 'SI',
            });
          }
          resolve(importedPallets);
        } catch (error) { reject(error); }
      };
      reader.readAsBinaryString(file);
    });

    toast.promise(promise, {
      loading: 'Procesando archivo...',
      success: (data) => { onSetPallets(data); return `Se importaron ${data.length} tarimas.`},
      error: (err) => `Error: ${err.message}`
    });
    event.target.value = '';
  };
  
  const PalletRow = ({ pallet }: { pallet: Pallet }) => {
    const isSelected = selectedPalletId === pallet.id;
    return (
      <div 
          className={`grid grid-cols-[1fr,1.2fr,0.8fr,0.5fr,0.5fr,0.5fr] gap-4 p-2 items-center cursor-pointer rounded-md transition-colors
            ${isSelected ? 'bg-cyan-900/50' : 'hover:bg-slate-700/50'}
            ${pallet.isImportant ? 'bg-green-900/20' : ''}
          `}
          onClick={() => onSelectPallet(pallet.id)}
      >
          <div className="truncate" title={pallet.id}>{pallet.id}</div>
          <div>{`${pallet.length}×${pallet.width}×${pallet.height}`}</div>
          <div>{`${pallet.weight} kg`}</div>
          <div className="flex justify-center">{pallet.isFragile ? <ShieldAlert className="text-yellow-400" size={20} /> : <ShieldCheck className="text-slate-500" size={20} />}</div>
          <div className="flex justify-center">{pallet.isImportant ? <Star className="text-green-500 fill-green-500" size={20} /> : <Star className="text-slate-500" size={20} />}</div>
          <div><button onClick={(e) => { e.stopPropagation(); onRemovePallet(pallet.id); }} className="text-red-500 hover:text-red-400 p-1"><Trash2 size={18} /></button></div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col min-h-[500px]">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="text-cyan-400" />
            Tarimas a Cargar ({pallets.length})
          </h2>
          <div className='flex gap-2'>
            <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls, .csv" style={{ display: 'none' }} />
            <button onClick={() => fileInputRef.current?.click()} className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors"><FileUp size={20} />Importar</button>
            <button onClick={() => setIsModalOpen(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-colors"><PackagePlus size={20} />Agregar</button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto pr-2">
          <div className="grid grid-cols-[1fr,1.2fr,0.8fr,0.5fr,0.5fr,0.5fr] gap-4 text-sm font-bold text-slate-400 p-2 border-b border-slate-700 sticky top-0 bg-slate-800">
            <div>ID</div>
            <div>Dimensiones</div>
            <div>Peso</div>
            <div className="text-center">Frágil</div>
            <div className="text-center">Import.</div>
            <div>Acciones</div>
          </div>
          <div className="divide-y divide-slate-700">
            {pallets.length > 0 ? (
              pallets.slice(0, VISIBLE_PALLET_LIMIT).map(pallet => <PalletRow key={pallet.id} pallet={pallet} />)
            ) : (
              <div className="text-center text-slate-500 p-8"><p>No hay tarimas agregadas.</p></div>
            )}
          </div>
        </div>
        {pallets.length > VISIBLE_PALLET_LIMIT && (
          <div className="text-center mt-4">
            <button onClick={() => setIsViewAllModalOpen(true)} className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-2 justify-center w-full">
              <Eye size={18} />
              Mostrar las {pallets.length} tarimas
            </button>
          </div>
        )}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Nueva Tarima"><AddPalletForm onAddPallet={onAddPallet} onClose={() => setIsModalOpen(false)} /></Modal>
      <Modal isOpen={isViewAllModalOpen} onClose={() => setIsViewAllModalOpen(false)} title={`Todas las Tarimas (${pallets.length})`}>
        <div className="max-h-[60vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-[1fr,1.2fr,0.8fr,0.5fr,0.5fr,0.5fr] gap-4 text-sm font-bold text-slate-400 p-2 border-b border-slate-700 sticky top-0 bg-slate-800">
            <div>ID</div><div>Dimensiones</div><div>Peso</div><div className="text-center">Frágil</div><div className="text-center">Import.</div><div>Acciones</div>
          </div>
          <div className="divide-y divide-slate-700">
            {pallets.map(pallet => <PalletRow key={pallet.id} pallet={pallet} />)}
          </div>
        </div>
      </Modal>
    </>
  );
}

