import React from 'react';

export default function SideBySideDiff({ originalText, rewrittenText }) {
    return (
        <div className="grid grid-cols-2 gap-4 my-4 font-mono text-sm">
            <div className="bg-stone-900 border border-stone-800 p-3 rounded text-stone-300">
                <div className="text-xs font-semibold text-stone-500 uppercase mb-1">Original</div>
                <div>{originalText}</div>
            </div>
            <div className="bg-stone-900 border border-emerald-900/50 p-3 rounded text-emerald-300">
                <div className="text-xs font-semibold text-emerald-500 uppercase mb-1">Rewritten</div>
                <div>{rewrittenText}</div>
            </div>
        </div>
    );
}
