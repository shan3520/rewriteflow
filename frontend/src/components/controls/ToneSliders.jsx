import React from 'react';

export default function ToneSliders({ values, onChange }) {
    return (
        <div className="space-y-3 bg-stone-900 border border-stone-800 p-4 rounded-md">
            <div>
                <label className="text-xs text-stone-300 block mb-1">Formality: {values.formality}%</label>
                <input 
                    type="range" min="0" max="100" 
                    value={values.formality} 
                    onChange={(e) => onChange('formality', Number(e.target.value))} 
                    className="w-full accent-amber-500"
                />
            </div>
        </div>
    );
}
