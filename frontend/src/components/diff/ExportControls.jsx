import React, { useState } from 'react';

export default function ExportControls({ text }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center space-x-2">
            <button 
                onClick={handleCopy}
                className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded border border-stone-700"
            >
                {copied ? 'Copied!' : 'Copy Text'}
            </button>
        </div>
    );
}
