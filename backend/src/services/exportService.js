function exportText(text, format = 'markdown') {
    if (format === 'html') {
        return `<div class="rewrite-content"><p>${text.replace(/\n/g, '</p><p>')}</p></div>`;
    } else if (format === 'markdown') {
        return `## Rewritten Text\n\n${text}\n`;
    }
    return text;
}
module.exports = { exportText };
