import React, { createContext, useContext, useState } from 'react';

const PipelineContext = createContext();

export function PipelineProvider({ children }) {
    const [nodes, setNodes] = useState([
        { id: '1', type: 'GrammarFixNode', config: {} },
        { id: '2', type: 'ToneShiftNode', config: { target_tone: 'formal' } }
    ]);
    const [edges, setEdges] = useState([{ source: '1', target: '2' }]);

    const addNode = (type) => {
        const newNode = { id: String(Date.now()), type, config: {} };
        setNodes((prev) => [...prev, newNode]);
    };

    const removeNode = (id) => {
        setNodes((prev) => prev.filter((n) => n.id !== id));
        setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
    };

    return (
        <PipelineContext.Provider value={{ nodes, edges, addNode, removeNode }}>
            {children}
        </PipelineContext.Provider>
    );
}

export const usePipeline = () => useContext(PipelineContext);
