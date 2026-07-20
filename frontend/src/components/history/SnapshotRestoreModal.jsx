import React from 'react';

export default function SnapshotRestoreModal({ snapshot, onRestore, onClose }) {
    if (!snapshot) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 text-stone-200">
            <div className="bg-stone-900 border border-stone-800 p-4 rounded">
                <div>Restore past iteration snapshot?</div>
                <button onClick={() => onRestore(snapshot)} className="mt-3 px-3 py-1 bg-amber-600 rounded text-xs">Restore</button>
            </div>
        </div>
    );
}
