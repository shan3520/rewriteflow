import { render } from '@testing-library/react';
import React from 'react';
import CommandPalette from '../components/palette/CommandPalette';

describe('CommandPalette', () => {
    it('renders without crashing', () => {
        render(<CommandPalette />);
    });
});
