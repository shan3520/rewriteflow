import { renderHook } from '@testing-library/react-hooks';
import { useSSEStream } from '../hooks/useSSEStream';

describe('useSSEStream', () => {
    it('initializes with streaming false', () => {
        const { result } = renderHook(() => useSSEStream('/api/v1/rewrite/stream'));
        expect(result.current.isStreaming).toBe(false);
    });
});
