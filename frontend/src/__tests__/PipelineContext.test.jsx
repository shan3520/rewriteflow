import { renderHook, act } from '@testing-library/react-hooks';
import React from 'react';
import { PipelineProvider, usePipeline } from '../context/PipelineContext';

describe('PipelineContext State', () => {
    it('should add and remove nodes', () => {
        const wrapper = ({ children }) => <PipelineProvider>{children}</PipelineProvider>;
        const { result } = renderHook(() => usePipeline(), { wrapper });

        act(() => {
            result.current.addNode('ParaphraseNode');
        });

        expect(result.current.nodes.length).toBe(3);
    });
});
