import React from 'react';
import { usePipeline } from '../../context/PipelineContext';
import NodeCard from './NodeCard';
import ConnectionLines from './ConnectionLines';

export default function PipelineCanvas() {
    const { nodes, edges } = usePipeline();

    return (
        <div className="relative w-full h-96 bg-stone-900 border border-stone-800 rounded-lg p-4 overflow-hidden">
            <ConnectionLines nodes={nodes} edges={edges} />
            <div className="flex space-x-6 relative z-10">
                {nodes.map((node) => (
                    <NodeCard key={node.id} node={node} />
                ))}
            </div>
        </div>
    );
}
