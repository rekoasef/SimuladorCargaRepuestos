'use client';
import { useState } from 'react';
import { Pallet } from '../../lib/types';

interface AddPalletFormProps {
  onAddPallet: (newPallet: Omit<Pallet, 'id'>) => void;
  onClose: () => void;
}

const initialFormState = {
    width: 1.2,
    length: 0.8,
    height: 1.0,
    weight: 150,
    isFragile: false,
};

export default function AddPalletForm({ onAddPallet, onClose }: AddPalletFormProps) {
    const [formData, setFormData] = useState(initialFormState);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : parseFloat(value) || 0,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddPallet(formData);
        onClose(); // Cierra la modal después de agregar
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="length" className="block text-sm font-medium text-slate-300 mb-1">Largo (m)</label>
                    <input type="number" name="length" id="length" value={formData.length} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2" step="0.1" required />
                </div>
                <div>
                    <label htmlFor="width" className="block text-sm font-medium text-slate-300 mb-1">Ancho (m)</label>
                    <input type="number" name="width" id="width" value={formData.width} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2" step="0.1" required />
                </div>
                <div>
                    <label htmlFor="height" className="block text-sm font-medium text-slate-300 mb-1">Alto (m)</label>
                    <input type="number" name="height" id="height" value={formData.height} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2" step="0.1" required />
                </div>
                <div>
                    <label htmlFor="weight" className="block text-sm font-medium text-slate-300 mb-1">Peso (kg)</label>
                    <input type="number" name="weight" id="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-700 border border-slate-600 rounded-md p-2" step="1" required />
                </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" name="isFragile" id="isFragile" checked={formData.isFragile} onChange={handleChange} className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-cyan-500 focus:ring-cyan-500" />
                <label htmlFor="isFragile" className="text-sm font-medium text-slate-300">¿Es un objeto frágil?</label>
            </div>

            <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-md">
                    Cancelar
                </button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md">
                    Agregar Tarima
                </button>
            </div>
        </form>
    );
}