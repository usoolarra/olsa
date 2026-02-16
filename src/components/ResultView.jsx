import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { FileText, List, CheckSquare, Network, Download, Copy, Share2 } from 'lucide-react';

const MOCK_DATA = {
    en: {
        transcript: `[00:00] Sarah: Thanks for joining everyone. Today we need to drive the Q4 product roadmap.
[00:15] Mike: I think we should prioritize the mobile app redesign. Users have been asking for dark mode.
[00:30] Sarah: Agreed, let's put that at the top. What about the API integration?
[00:45] Jen: The API is stable, but we need documentation. That's a blocker for partners.
[01:00] Sarah: Okay, so action items: Mike on UI, Jen on Docs.`,
        summary: `The team met to discuss the Q4 product roadmap. Key priorities identified were the mobile app redesign (specifically dark mode) and API documentation for partners.`,
        actionItems: [
            { id: 1, text: "Design Dark Mode interface for mobile app", owner: "Mike", status: "pending" },
            { id: 2, text: "Write comprehensive API documentation", owner: "Jen", status: "pending" },
            { id: 3, text: "Finalize Q4 roadmap schedule", owner: "Sarah", status: "in-progress" }
        ],
        mindMap: [
            { id: 'root', label: 'Q4 Roadmap', x: 50, y: 50 },
            { id: '1', label: 'Mobile App', x: 20, y: 80, parent: 'root' },
            { id: '2', label: 'API Docs', x: 80, y: 80, parent: 'root' },
            { id: '3', label: 'Dark Mode', x: 20, y: 110, parent: '1' },
            { id: '4', label: 'Partner Access', x: 80, y: 110, parent: '2' },
        ]
    },
    es: {
        transcript: `[00:00] Sarah: Gracias por unirse a todos. Hoy necesitamos definir la hoja de ruta del producto para el Q4.
[00:15] Mike: Creo que deberíamos priorizar el rediseño de la app móvil. Los usuarios han estado pidiendo el modo oscuro.
[00:30] Sarah: De acuerdo, pongamos eso en lo más alto. ¿Qué pasa con la integración de la API?
[00:45] Jen: La API es estable, pero necesitamos documentación. Eso es un bloqueo para los socios.
[01:00] Sarah: Vale, entonces tareas: Mike en UI, Jen en Documentación.`,
        summary: `El equipo se reunió para discutir la hoja de ruta del producto Q4. Las prioridades clave identificadas fueron el rediseño de la aplicación móvil (específicamente el modo oscuro) y la documentación de la API para los socios.`,
        actionItems: [
            { id: 1, text: "Diseñar interfaz de Modo Oscuro para app móvil", owner: "Mike", status: "pending" },
            { id: 2, text: "Escribir documentación completa de la API", owner: "Jen", status: "pending" },
            { id: 3, text: "Finalizar cronograma de hoja de ruta Q4", owner: "Sarah", status: "in-progress" }
        ],
        mindMap: [
            { id: 'root', label: 'Hoja de Ruta Q4', x: 50, y: 50 },
            { id: '1', label: 'App Móvil', x: 20, y: 80, parent: 'root' },
            { id: '2', label: 'Docs API', x: 80, y: 80, parent: 'root' },
            { id: '3', label: 'Modo Oscuro', x: 20, y: 110, parent: '1' },
            { id: '4', label: 'Acceso Socios', x: 80, y: 110, parent: '2' },
        ]
    }
};

const ResultView = ({ t = {}, lang = 'en', data }) => {
    const [activeTab, setActiveTab] = useState('summary');
    const [localActionItems, setLocalActionItems] = useState([]);

    // Base data from props or mock
    const baseData = data || MOCK_DATA[lang] || MOCK_DATA['en'];

    // Sync local state with incoming data
    React.useEffect(() => {
        if (baseData?.actionItems) {
            setLocalActionItems(baseData.actionItems);
        }
    }, [data, lang]);

    // Merge base data with local state for rendering
    const displayData = {
        ...baseData,
        actionItems: localActionItems.length > 0 ? localActionItems : (baseData.actionItems || [])
    };

    const toggleActionStatus = (index) => {
        setLocalActionItems(prev => prev.map((item, i) => {
            if (i === index) {
                return {
                    ...item,
                    status: item.status === 'pending' ? 'completed' : 'pending'
                };
            }
            return item;
        }));
    };

    const tabs = [
        { id: 'transcript', label: t.tabs?.transcript || 'Transcript', icon: FileText },
        { id: 'summary', label: t.tabs?.summary || 'Summary', icon: List },
        { id: 'actions', label: t.tabs?.actions || 'Action Items', icon: CheckSquare },
        { id: 'mindmap', label: t.tabs?.mindmap || 'Mind Map', icon: Network },
    ];

    const handleCopy = () => {
        let content = "";
        if (activeTab === 'transcript') content = displayData.text || displayData.transcript;
        else if (activeTab === 'summary') content = displayData.summary;
        else if (activeTab === 'actions') content = displayData.actionItems.map(i => `- ${i.text} (${i.owner})`).join('\n');

        navigator.clipboard.writeText(content);
        alert('Copied to clipboard!');
    };

    const handleExport = () => {
        if (activeTab === 'mindmap') {
            // Basic JSON export for Mind Map structure
            const content = JSON.stringify(displayData.mindMap, null, 2);
            const blob = new Blob([content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mindmap.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const maxLineWidth = pageWidth - margin * 2;
        let y = margin;

        const checkPageBreak = (height = 10) => {
            if (y + height > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }
        };

        if (activeTab === 'transcript') {
            doc.setFontSize(16);
            doc.text("Transcript", margin, y);
            y += 10;
            doc.setFontSize(12);

            if (displayData.utterances) {
                displayData.utterances.forEach((u) => {
                    const speaker = `Speaker ${u.speaker}`;
                    const text = u.text;

                    checkPageBreak(20);

                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(59, 130, 246); // Primary Color (Blue)
                    doc.text(speaker, margin, y);
                    y += 7;

                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0, 0, 0); // Reset color
                    const lines = doc.splitTextToSize(text, maxLineWidth);
                    const textHeight = lines.length * 7;

                    checkPageBreak(textHeight);
                    doc.text(lines, margin, y);
                    y += textHeight + 5; // spacing between utterances
                });
            } else {
                const text = displayData.text || displayData.transcript;
                const lines = doc.splitTextToSize(text, maxLineWidth);
                doc.text(lines, margin, y);
            }
        } else if (activeTab === 'summary') {
            doc.setFontSize(16);
            doc.text("Executive Summary", margin, y);
            y += 10;
            doc.setFontSize(12);

            const text = displayData.summary;
            const lines = doc.splitTextToSize(text, maxLineWidth);
            doc.text(lines, margin, y);
        } else if (activeTab === 'actions') {
            doc.setFontSize(16);
            doc.text("Action Items", margin, y);
            y += 10;
            doc.setFontSize(12);

            displayData.actionItems.forEach((item) => {
                const text = `- ${item.text} (${item.owner}) [${item.status}]`;
                const lines = doc.splitTextToSize(text, maxLineWidth);
                const height = lines.length * 7;
                checkPageBreak(height);
                doc.text(lines, margin, y);
                y += height + 5;
            });
        }

        doc.save(`transcription-${activeTab}.pdf`);
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '1000px',
            background: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-bg-secondary)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '80vh',
            maxHeight: '800px'
        }}>
            {/* Header / Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--color-bg-secondary)',
                background: 'rgba(15, 23, 42, 0.5)'
            }}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: 'var(--spacing-4)',
                                background: isActive ? 'var(--color-bg-secondary)' : 'transparent',
                                border: 'none',
                                borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
                                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 'var(--spacing-2)',
                                transition: 'all var(--transition-fast)',
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: '500'
                            }}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content Area */}
            <div style={{
                flex: 1,
                padding: 'var(--spacing-6)',
                overflowY: 'auto',
                background: 'var(--color-bg-card)'
            }}>
                {activeTab === 'transcript' && (
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--color-text-secondary)' }}>
                        {displayData.utterances ? (
                            displayData.utterances.map((u, i) => (
                                <p key={i} style={{ marginBottom: 'var(--spacing-2)' }}>
                                    <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                                        Speaker {u.speaker}:
                                    </span>
                                    {" " + u.text}
                                </p>
                            ))
                        ) : (
                            <p>{displayData.text || displayData.transcript}</p>
                        )}
                    </div>
                )}

                {activeTab === 'summary' && (
                    <div>
                        <h3 style={{ marginBottom: 'var(--spacing-4)', color: 'var(--color-text-primary)' }}>{t.execSummary || 'Executive Summary'}</h3>
                        <p style={{ lineHeight: '1.6', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)', whiteSpace: 'pre-wrap' }}>
                            {displayData.summary}
                        </p>
                    </div>
                )}

                {activeTab === 'actions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                        {displayData.actionItems.map((item, idx) => (
                            <div
                                key={idx}
                                onClick={() => toggleActionStatus(idx)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 'var(--spacing-3)',
                                    background: item.status === 'completed' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.03)',
                                    borderRadius: 'var(--radius-md)',
                                    border: `1px solid ${item.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'var(--color-bg-secondary)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    marginRight: 'var(--spacing-3)',
                                    color: item.status === 'completed' ? 'var(--color-success)' : 'var(--color-primary)'
                                }}>
                                    <CheckSquare size={20} />
                                </div>
                                <div style={{ flex: 1, opacity: item.status === 'completed' ? 0.7 : 1, textDecoration: item.status === 'completed' ? 'line-through' : 'none' }}>
                                    <p style={{ color: 'var(--color-text-primary)' }}>{item.text}</p>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>Owner: {item.owner}</p>
                                </div>
                                <div style={{
                                    fontSize: 'var(--font-size-xs)',
                                    padding: 'var(--spacing-1) var(--spacing-2)',
                                    background: item.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                    color: item.status === 'pending' ? 'var(--color-warning)' : 'var(--color-success)',
                                    borderRadius: 'var(--radius-sm)',
                                    textTransform: 'capitalize',
                                    minWidth: '80px',
                                    textAlign: 'center'
                                }}>
                                    {item.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'mindmap' && (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        minHeight: '400px',
                        position: 'relative',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 'var(--radius-lg)'
                    }}>
                        {displayData.mindMap.map(node => (
                            <React.Fragment key={node.id}>
                                <div style={{
                                    position: 'absolute',
                                    left: `${node.x}%`,
                                    top: `${node.y}px`,
                                    transform: 'translate(-50%, -50%)',
                                    padding: 'var(--spacing-2) var(--spacing-4)',
                                    background: node.id === 'root' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                                    border: `1px solid ${node.id === 'root' ? 'var(--color-primary)' : 'var(--color-text-secondary)'}`,
                                    borderRadius: 'var(--radius-lg)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: 'var(--font-size-sm)',
                                    boxShadow: 'var(--shadow-md)',
                                    zIndex: 2,
                                    textAlign: 'center',
                                    minWidth: '120px'
                                }}>
                                    {node.label}
                                </div>
                            </React.Fragment>
                        ))}
                        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
                            {displayData.mindMap.filter(n => n.parent).map(node => {
                                const parent = displayData.mindMap.find(p => p.id === node.parent);
                                if (!parent) return null;
                                return (
                                    <line
                                        key={`${node.id}-line`}
                                        x1={`${parent.x}%`}
                                        y1={`${parent.y}px`}
                                        x2={`${node.x}%`}
                                        y2={`${node.y}px`}
                                        stroke="var(--color-text-secondary)"
                                        strokeWidth="1"
                                        opacity="0.5"
                                    />
                                );
                            })}
                        </svg>
                    </div>
                )}
            </div>

            {/* Footer / Actions */}
            <div style={{
                padding: 'var(--spacing-4)',
                borderTop: '1px solid var(--color-bg-secondary)',
                background: 'rgba(15, 23, 42, 0.5)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 'var(--spacing-3)'
            }}>
                <button
                    onClick={handleCopy}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--color-bg-secondary)',
                        color: 'var(--color-text-secondary)',
                        padding: 'var(--spacing-2) var(--spacing-4)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                        cursor: 'pointer'
                    }}>
                    <Copy size={16} /> Copy
                </button>
                <button
                    onClick={handleExport}
                    style={{
                        background: 'var(--color-primary)',
                        border: 'none',
                        color: 'white',
                        padding: 'var(--spacing-2) var(--spacing-4)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-2)',
                        cursor: 'pointer'
                    }}>
                    <Download size={16} /> {t.export || 'Export'} {activeTab === 'mindmap' ? 'PNG' : 'PDF'}
                </button>
            </div>
        </div>
    );
};

export default ResultView;
