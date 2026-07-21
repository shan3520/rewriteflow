import { render } from '@testing-library/react';
import React from 'react';
import ThemeToggle from '../components/ui/ThemeToggle';

describe('ThemeToggle', () => {
    it('renders theme toggle component', () => {
        render(<ThemeToggle />);
    });
});
