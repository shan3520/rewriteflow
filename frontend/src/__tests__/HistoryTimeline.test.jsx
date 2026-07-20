import { render, screen } from '@testing-library/react';
import React from 'react';
import HistoryTimeline from '../components/history/HistoryTimeline';

describe('HistoryTimeline', () => {
    it('renders timeline items', () => {
        render(<HistoryTimeline items={[{ timestamp: '10:00', label: 'Initial Draft' }]} />);
        expect(screen.getByText('Initial Draft')).toBeInTheDocument();
    });
});
