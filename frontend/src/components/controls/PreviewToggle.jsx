import React from 'react';

export default function PreviewToggle({ enabled, onToggle }) {
    return (
        <label className="flex items-center space-x-2 text-xs text-stone-300 cursor-pointer">
            <input 
                type="checkbox" 
                checked={enabled} 
                onChange={(e) => onToggle(e.target.checked)} 
                className="rounded bg-stone-800 accent-amber-500"
            />
            <span>Instant Preview</span>
        </label>
    );
}
