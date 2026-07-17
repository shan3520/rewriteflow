import React from 'react';

export default function TemplateEditorModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 w-full max-w-md text-stone-200">
                <h2 className="text-lg font-semibold mb-4">Create Template</h2>
                <button onClick={onClose} className="px-4 py-2 bg-stone-800 text-xs rounded">Cancel</button>
            </div>
        </div>
    );
}
