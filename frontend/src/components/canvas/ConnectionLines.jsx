import React from 'react';

export default function ConnectionLines({ nodes, edges }) {
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-amber-500/50" strokeWidth="2">
            <line x1="50" y1="50" x2="200" y2="50" strokeDasharray="4" />
        </svg>
    );
}
