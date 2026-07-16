import { useState, useEffect, useRef } from 'react';

export function useSSEStream(url) {
    const [data, setData] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const eventSourceRef = useRef(null);

    useEffect(() => {
        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

    return { data, isStreaming };
}
