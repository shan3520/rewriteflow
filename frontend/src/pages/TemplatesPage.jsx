import React from 'react';
import TemplateLibrary from '../components/templates/TemplateLibrary';

export default function TemplatesPage() {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-stone-100 mb-4">Prompt Templates</h1>
            <TemplateLibrary />
        </div>
    );
}
