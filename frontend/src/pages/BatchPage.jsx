import React from 'react';
import BatchDashboard from '../components/batch/BatchDashboard';

export default function BatchPage() {
    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-stone-100 mb-4">Batch Rewrite Processing</h1>
            <BatchDashboard />
        </div>
    );
}
