import React from 'react';

export default function BatchUploadModal({ isOpen, onClose }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-stone-900 border border-stone-800 p-6 rounded text-stone-200">
                <h2>Upload Batch File (CSV/JSON)</h2>
                <button onClick={onClose} className="mt-4 px-3 py-1 bg-stone-800 rounded">Close</button>
            </div>
        </div>
    );
}
