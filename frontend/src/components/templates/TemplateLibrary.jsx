import React from 'react';

export default function TemplateLibrary() {
    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-stone-900 border border-stone-800 rounded text-stone-200">
                <h3 className="font-semibold text-amber-400">Executive Email</h3>
                <p className="text-xs text-stone-400 mt-1">Polishes casual drafts into formal email messages.</p>
            </div>
        </div>
    );
}
