import React from 'react';
import { usePipeline } from '../../context/PipelineContext';

export default function NodeCard({ node }) {
    const { removeNode } = usePipeline();

    return (
        <div className="bg-stone-800 border border-stone-700 rounded-md p-3 w-48 text-stone-200 shadow-md">
            <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-amber-400">{node.type}</span>
                <button 
                    onClick={() => removeNode(node.id)}
                    className="text-stone-400 hover:text-red-400 text-xs"
                >
                    &times;
                </button>
            </div>
            <div className="text-xs text-stone-400">Node ID: {node.id}</div>
        </div>
    );
}
