import { useState } from 'react';

export function usePipelineRunner() {
    const [running, setRunning] = useState(false);

    const runPipeline = async (text) => {
        setRunning(true);
        // Execute pipeline
        setRunning(false);
    };

    return { running, runPipeline };
}
