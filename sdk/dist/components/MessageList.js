"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export default function MessageList({ messages }) {
    return (_jsx("div", { style: { padding: 12, maxHeight: 400, overflowY: 'auto', border: '1px solid #eee' }, children: messages.map((m, i) => (_jsxs("div", { style: { marginBottom: 8 }, children: [_jsx("div", { style: { fontSize: 12, color: '#666' }, children: m.role }), _jsx("div", { style: { whiteSpace: 'pre-wrap' }, children: m.text })] }, i))) }));
}
//# sourceMappingURL=MessageList.js.map