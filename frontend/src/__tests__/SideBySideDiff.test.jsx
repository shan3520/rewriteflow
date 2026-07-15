import { render, screen } from '@testing-library/react';
import React from 'react';
import SideBySideDiff from '../components/diff/SideBySideDiff';

describe('SideBySideDiff', () => {
    it('renders original and rewritten text', () => {
        render(<SideBySideDiff originalText="Hello" rewrittenText="Hello world" />);
        expect(screen.getByText('Original')).toBeInTheDocument();
        expect(screen.getByText('Rewritten')).toBeInTheDocument();
    });
});
