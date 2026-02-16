import React, { useState, useEffect } from 'react';
import { Upload, ChevronDown, Check } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ProcessVisualizer from './components/ProcessVisualizer';
import ResultView from './components/ResultView';
import LandingPage from './components/LandingPage';
import { translations } from './translations';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [lang, setLang] = useState('es');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [transcriptionData, setTranscriptionData] = useState(null);
  const [error, setError] = useState(null);

  // Improved language fallback
  const t = translations[lang] || translations['en'] || {};

  const [jobId, setJobId] = useState(null);

  const handleFileSelect = async (selectedFile) => {
    // ... logic remains same ...
    setFile(selectedFile);
    setIsProcessing(true);
    setCurrentStep(0);
    setError(null);
    setJobId(null);

    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      // Check if response is direct transcription or job ID
      const data = await response.json();

      if (data.id) {
        setJobId(data.id);
      } else {
        // Direct result (fallback)
        setTranscriptionData(data);
        setIsComplete(true);
        setCurrentStep(4);
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Error processing file. Please ensure the server is running and API key is valid.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // ... useEffect remains same ...
    let intervalId;

    if (isProcessing && jobId && !isComplete) {
      intervalId = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/status/${jobId}`);
          if (!response.ok) return; // Silent fail on network error during polling

          const data = await response.json();

          if (data.status === 'completed') {
            setTranscriptionData(data.data);
            setIsComplete(true);
            setCurrentStep(4); // Insights done
            clearInterval(intervalId);
          } else if (data.status === 'error') {
            setError('Transcription failed: ' + (data.error || 'Unknown error'));
            setIsProcessing(false);
            setJobId(null);
            clearInterval(intervalId);
          } else {
            // Still processing
            setCurrentStep((prev) => {
              if (prev < 2) return prev + 1;
              return prev;
            });
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isProcessing, isComplete, jobId]);

  // If on landing page, show the new specialized landing component
  if (showLanding) {
    return (
      <ErrorBoundary>
        <LandingPage onGetStarted={() => setShowLanding(false)} t={t} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-container">
        <header style={{
          padding: 'var(--spacing-6) var(--spacing-8)',
          borderBottom: '1px solid var(--color-bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          zIndex: 50
        }}>
          <div
            onClick={() => setShowLanding(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', cursor: 'pointer' }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--color-accent-gradient)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <path d="M12 2a10 10 0 0 1 10 10" />
                <path d="M12 12l9.5-2.5" />
              </svg>
            </div>
            <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: '600' }}>LSB-USO Olarra <span style={{ color: 'var(--color-primary)' }}>TranscribeAI</span></h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            {/* Language Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-1)',
                  cursor: 'pointer',
                  fontSize: 'var(--font-size-sm)'
                }}
              >
                {lang === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'} <ChevronDown size={14} />
              </button>

              {showLangMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  marginTop: 'var(--spacing-2)',
                  background: 'var(--color-bg-card)',
                  border: '1px solid var(--color-bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  minWidth: '120px',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <button
                    onClick={() => { setLang('en'); setShowLangMenu(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      background: lang === 'en' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: lang === 'en' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    🇺🇸 English {lang === 'en' && <Check size={14} />}
                  </button>
                  <button
                    onClick={() => { setLang('es'); setShowLangMenu(false); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      background: lang === 'es' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      color: lang === 'es' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    🇪🇸 Español {lang === 'es' && <Check size={14} />}
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowLanding(true)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Home
            </button>
          </div>
        </header>

        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          minHeight: 'calc(100vh - 80px)'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '1200px',
            padding: 'var(--spacing-8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1
          }}>
            {!isProcessing ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-12)' }}>
                  <h2 style={{
                    fontSize: 'var(--font-size-3xl)',
                    marginBottom: 'var(--spacing-4)',
                    background: 'var(--color-accent-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}>
                    {t.mainTitle}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)', maxWidth: '600px', margin: '0 auto' }}>
                    {t.mainDesc}
                  </p>
                </div>

                <FileUpload onFileSelect={handleFileSelect} t={t} />
              </>
            ) : !showResults ? (
              <div style={{ width: '100%', maxWidth: '800px' }}>
                <div style={{ marginBottom: 'var(--spacing-8)', textAlign: 'center' }}>
                  <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-2)' }}>
                    {isComplete ? t.analyzing : t.processing}
                  </h2>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    {file?.name}
                  </p>
                </div>

                <ProcessVisualizer currentStepIndex={currentStep} t={t} />

                {isComplete && (
                  <div style={{ marginTop: 'var(--spacing-12)', textAlign: 'center' }}>
                    <button
                      onClick={() => setShowResults(true)}
                      style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        padding: 'var(--spacing-3) var(--spacing-8)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-base)',
                        fontWeight: '500',
                        boxShadow: 'var(--shadow-lg)',
                        transition: 'transform var(--transition-fast)'
                      }}
                      onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      {t.viewResults}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: 'var(--spacing-6)', width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontSize: 'var(--font-size-xl)' }}>{t.insights?.analyzing || "Analysis Results"}</h2>
                  <button
                    onClick={() => {
                      setIsProcessing(false);
                      setShowResults(false);
                      setIsComplete(false);
                      setCurrentStep(0);
                      setFile(null);
                      setTranscriptionData(null);
                      setError(null);
                      setJobId(null);
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      fontSize: 'var(--font-size-sm)'
                    }}
                  >
                    {t.annotateAnother}
                  </button>
                </div>
                {error && (
                  <div style={{
                    marginBottom: 'var(--spacing-6)',
                    padding: 'var(--spacing-4)',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid var(--color-danger)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--color-danger)',
                    fontSize: 'var(--font-size-sm)'
                  }}>
                    {error}
                  </div>
                )}
                <ResultView t={t} lang={lang} data={transcriptionData} />
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default App;
