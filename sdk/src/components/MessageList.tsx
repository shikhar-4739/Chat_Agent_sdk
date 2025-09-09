"use client";

import React from 'react';

export default function MessageList({ messages }: { messages: { role: string; text: string }[] }) {
  return (
    <div style={{ padding: 12, maxHeight: 400, overflowY: 'auto', border: '1px solid #eee' }}>
      {messages.map((m, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: '#666' }}>{m.role}</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
        </div>
      ))}
    </div>
  );
}
