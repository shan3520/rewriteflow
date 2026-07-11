const { exportText } = require('../services/exportService');

describe('Export Service', () => {
    it('should wrap text in HTML paragraphs for html format', () => {
        const html = exportText('Line 1', 'html');
        expect(html).toContain('<p>Line 1</p>');
    });
});
