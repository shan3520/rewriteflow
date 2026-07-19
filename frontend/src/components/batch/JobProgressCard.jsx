import React from 'react';

export default function JobProgressCard({ progress = 0 }) {
    return (
        <div className="bg-stone-900 border border-stone-800 p-3 rounded">
            <div className="text-xs text-stone-400 mb-1">Processing Batch: {progress}%</div>
            <div className="w-full bg-stone-800 h-2 rounded overflow-hidden">
                <div className="bg-amber-500 h-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
        </div>
    );
}
