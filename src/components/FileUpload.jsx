import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, FileVideo } from 'lucide-react';

const FileUpload = ({ onFileSelect, t = {} }) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Fallback values if t is missing
    const text = {
        uploadTitle: t.uploadTitle || 'Upload Audio or Video',
        dropItHere: 'Drop it here!', // Hardcoded fallback or add to translations
        uploadDesc: t.uploadDesc || 'Drag & drop your file here or click to browse'
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            validateAndPassFile(files[0]);
        }
    };

    const handleFileInput = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndPassFile(files[0]);
        }
    };

    const validateAndPassFile = (file) => {
        if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
            onFileSelect(file);
        } else {
            alert('Please upload an audio or video file.');
        }
    };

    const onBoxClick = () => {
        fileInputRef.current.click();
    };

    return (
        <div
            className={`upload-zone ${isDragging ? 'dragging' : ''}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={onBoxClick}
            style={{
                width: '100%',
                maxWidth: '600px',
                minHeight: '320px',
                border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-bg-secondary)'}`,
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'rgba(30, 41, 59, 0.5)',
                gap: 'var(--spacing-6)',
                cursor: 'pointer',
                transition: 'all var(--transition-normal)',
                padding: 'var(--spacing-8)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInput}
                style={{ display: 'none' }}
                accept="audio/*,video/*"
            />

            {/* Decorative background glow */}
            <div style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                opacity: isDragging ? 1 : 0.5,
                transition: 'opacity var(--transition-normal)',
                pointerEvents: 'none'
            }} />

            <div style={{
                width: '80px',
                height: '80px',
                background: isDragging ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-normal)',
                boxShadow: isDragging ? '0 0 20px rgba(59, 130, 246, 0.4)' : 'none',
                zIndex: 1
            }}>
                <UploadCloud
                    size={40}
                    color={isDragging ? '#ffffff' : 'var(--color-text-secondary)'}
                    style={{ transition: 'color var(--transition-normal)' }}
                />
            </div>

            <div style={{ textAlign: 'center', zIndex: 1, pointerEvents: 'none' }}>
                <h3 style={{
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: '600',
                    marginBottom: 'var(--spacing-2)',
                    color: 'var(--color-text-primary)'
                }}>
                    {isDragging ? text.dropItHere : text.uploadTitle}
                </h3>
                <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-base)',
                    maxWidth: '300px',
                    margin: '0 auto'
                }}>
                    {text.uploadDesc}
                </p>
            </div>

            <div style={{
                display: 'flex',
                gap: 'var(--spacing-4)',
                zIndex: 1
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    <FileAudio size={16} /> MP3, WAV
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                    <FileVideo size={16} /> MP4, MOV
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
