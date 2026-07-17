import { render, screen } from '@testing-library/react';
import React from 'react';
import TemplateLibrary from '../components/templates/TemplateLibrary';

describe('TemplateLibrary', () => {
    it('renders template library grid', () => {
        render(<TemplateLibrary />);
        expect(screen.getByText('Executive Email')).toBeInTheDocument();
    });
});
