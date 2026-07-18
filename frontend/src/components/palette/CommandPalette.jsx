import React, { useState, useEffect } from 'react';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center pt-20 z-50">
            <div className="bg-stone-900 border border-stone-700 rounded-lg p-4 w-full max-w-lg">
                <input 
                    type="text" 
                    placeholder="Type a command or search..." 
                    className="w-full bg-stone-800 border border-stone-700 rounded px-3 py-2 text-stone-200 text-sm focus:outline-none"
                />
            </div>
        </div>
    );
}
