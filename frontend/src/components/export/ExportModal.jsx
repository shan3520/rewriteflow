import React from 'react';

export default function ExportModal({ isOpen, onClose, onExport }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 text-stone-200">
            <div className="bg-stone-900 border border-stone-800 p-6 rounded max-w-sm w-full">
                <h3 className="font-semibold mb-4">Export Options</h3>
                <div className="space-y-2">
                    <button onClick={() => onExport('pdf')} className="w-full text-left px-3 py-2 bg-stone-800 rounded hover:bg-stone-700">Export as PDF</button>
                    <button onClick={() => onExport('docx')} className="w-full text-left px-3 py-2 bg-stone-800 rounded hover:bg-stone-700">Export as DOCX</button>
                </div>
                <button onClick={onClose} className="mt-4 px-3 py-1 bg-stone-800 rounded text-xs">Cancel</button>
            </div>
        </div>
    );
}
