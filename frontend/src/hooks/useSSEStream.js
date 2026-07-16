import { useState, useEffect } from 'react';

export function useSSEStream(url) {
    const [data, setData] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);

    const startStream = (payload) => {
        setIsStreaming(true);
        // Connect to SSE endpoint
    };

    return { data, isStreaming, startStream };
}
