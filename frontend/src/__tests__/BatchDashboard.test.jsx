import { render, screen } from '@testing-library/react';
import React from 'react';
import BatchDashboard from '../components/batch/BatchDashboard';

describe('BatchDashboard', () => {
    it('renders batch dashboard', () => {
        render(<BatchDashboard />);
        expect(screen.getByText('No active batch jobs running.')).toBeInTheDocument();
    });
});
