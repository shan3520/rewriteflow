import React from 'react';

export default function ExportStyleOptions({ config, onChange }) {
    return (
        <div className="text-xs space-y-2 text-stone-300">
            <label className="block">Font Size: {config?.fontSize || '12pt'}</label>
        </div>
    );
}
