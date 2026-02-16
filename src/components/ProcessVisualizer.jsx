import React from 'react';
import { Upload, FileAudio, Type, Sparkles, CheckCircle2 } from 'lucide-react';

const ProcessVisualizer = ({ currentStepIndex = 0, t = {} }) => {
    const stepsData = {
        uploading: t.steps?.uploading || 'Uploading',
        analyzing: t.steps?.analyzing || 'Analyzing Audio',
        transcribing: t.steps?.transcribing || 'Transcribing',
        insights: t.steps?.insights || 'Generating Insights'
    };

    const steps = [
        { id: 'uploading', label: stepsData.uploading, icon: Upload },
        { id: 'analyzing', label: stepsData.analyzing, icon: FileAudio },
        { id: 'transcribing', label: stepsData.transcribing, icon: Type },
        { id: 'insights', label: stepsData.insights, icon: Sparkles },
    ];

    return (
        <div style={{
            width: '100%',
            maxWidth: '800px',
            margin: '0 auto'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
            }}>
                {/* Progress Bar Background */}
                <div style={{
                    position: 'absolute',
                    top: '24px',
                    left: '0',
                    right: '0',
                    height: '4px',
                    background: 'var(--color-bg-secondary)',
                    zIndex: 0
                }} />

                {/* Active Progress Bar */}
                <div style={{
                    position: 'absolute',
                    top: '24px',
                    left: '0',
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    height: '4px',
                    background: 'var(--color-primary)',
                    transition: 'width var(--transition-normal)',
                    zIndex: 0
                }} />

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index === currentStepIndex;
                    const isCompleted = index < currentStepIndex;

                    return (
                        <div key={step.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                background: isCompleted || isActive ? 'var(--color-bg-primary)' : 'var(--color-bg-secondary)',
                                border: `2px solid ${isCompleted ? 'var(--color-success)' : isActive ? 'var(--color-primary)' : 'var(--color-bg-secondary)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all var(--transition-normal)',
                                boxShadow: isActive ? '0 0 0 4px rgba(59, 130, 246, 0.2)' : 'none',
                                marginBottom: 'var(--spacing-2)'
                            }}>
                                {isCompleted ? (
                                    <CheckCircle2 size={24} color="var(--color-success)" />
                                ) : (
                                    <Icon
                                        size={24}
                                        color={isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'}
                                    />
                                )}
                            </div>
                            <span style={{
                                fontSize: 'var(--font-size-sm)',
                                fontWeight: isActive ? '600' : '400',
                                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                                transition: 'color var(--transition-normal)'
                            }}>
                                {step.label}
                            </span>

                            {isActive && (
                                <div style={{
                                    marginTop: 'var(--spacing-1)',
                                    fontSize: 'var(--font-size-xs)',
                                    color: 'var(--color-primary)',
                                    animation: 'pulse 1.5s infinite'
                                }}>
                                    Processing...
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
        </div>
    );
};

export default ProcessVisualizer;
