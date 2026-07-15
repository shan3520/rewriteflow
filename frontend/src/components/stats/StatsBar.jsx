import React from 'react';

export default function StatsBar({ stats }) {
    return (
        <div className="flex items-center space-x-6 text-xs text-stone-400 bg-stone-900/80 px-4 py-2 rounded-md border border-stone-800">
            <div>Words: <span className="text-stone-200 font-medium">{stats?.wordCount || 0}</span></div>
            <div>Readability: <span className="text-amber-400 font-medium">{stats?.readability || '8.5'}</span></div>
            <div>Tone: <span className="text-emerald-400 font-medium">{stats?.tone || 'Formal'}</span></div>
        </div>
    );
}
