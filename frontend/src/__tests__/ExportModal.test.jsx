import { render, screen } from '@testing-library/react';
import React from 'react';
import ExportModal from '../components/export/ExportModal';

describe('ExportModal', () => {
    it('renders export formats', () => {
        render(<ExportModal isOpen={true} />);
        expect(screen.getByText('Export as PDF')).toBeInTheDocument();
    });
});
