import React, { memo } from 'react';

const HistoryItem = memo(({ item }) => (
    <div className="border-l-2 border-amber-500 pl-4 py-1 text-xs text-stone-300">
        <div>{item.timestamp}</div>
        <div className="font-semibold">{item.label}</div>
    </div>
));

export default function HistoryTimeline({ items = [] }) {
    return (
        <div className="space-y-4">
            {items.map((item, idx) => (
                <HistoryItem key={idx} item={item} />
            ))}
        </div>
    );
}
