import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted, t = {} }) => {
    return (
        <div className="landing-container">
            {/* Animated Background */}
            <div className="bg-animation">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
            </div>

            <div className="lp-content-container">
                <nav className="lp-nav">
                    <div className="lp-logo">LSB-USO Olarra <span>TranscribeAI</span></div>
                    <div className="nav-links">
                        <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>{t.lp_navFeatures || "Features"}</a>
                        <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>{t.lp_navSolutions || "Solutions"}</a>
                        <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>{t.lp_navPricing || "Pricing"}</a>
                    </div>
                    <button className="lp-btn lp-btn-primary" onClick={onGetStarted}>
                        {t.startFree || "Start for Free"}
                    </button>
                </nav>

                <section className="lp-hero">
                    <div className="lp-hero-content">
                        <span className="lp-badge">{t.lp_heroBadge || "🚀 The Future of Transcription"}</span>
                        <h1>{t.lp_heroTitlePrefix || "Turn Every Word"} <br /> {t.lp_heroTitleSuffix || "Into Actionable Insight"}</h1>
                        <p className="lead">
                            {t.lp_heroDesc || "Stop taking notes. Start engaging. LSB-USO Olarra TranscribeAI captures, transcribes, and organizes your meetings with 99% accuracy."}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button className="lp-btn lp-btn-primary" onClick={onGetStarted}>
                                {t.lp_startTranscribing || "Start Transcribing"}
                            </button>
                            <button className="lp-btn"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                                {t.watchDemo || "Watch Demo"}
                            </button>
                        </div>
                    </div>

                    <div className="lp-hero-visual">
                        <div className="glass-card">
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                                <div style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}></div>
                                <div style={{ width: '12px', height: '12px', background: '#f59e0b', borderRadius: '50%' }}></div>
                                <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '50%' }}></div>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ height: '10px', width: '70%', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginBottom: '10px' }}></div>
                                <div style={{ height: '10px', width: '50%', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', marginBottom: '10px' }}></div>
                                <div style={{ height: '10px', width: '90%', background: 'rgba(255,255,255,0.1)', borderRadius: '5px' }}></div>
                            </div>

                            <div className="wave-container">
                                <div className="bar" style={{ animationDuration: '0.8s' }}></div>
                                <div className="bar" style={{ animationDuration: '1.1s' }}></div>
                                <div className="bar" style={{ animationDuration: '1.3s' }}></div>
                                <div className="bar" style={{ animationDuration: '0.9s' }}></div>
                                <div className="bar" style={{ animationDuration: '1.5s' }}></div>
                                <div className="bar" style={{ animationDuration: '1.2s' }}></div>
                                <div className="bar" style={{ animationDuration: '1.0s' }}></div>
                                <div className="bar" style={{ animationDuration: '1.4s' }}></div>
                            </div>

                            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.9rem' }}>
                                <span>{t.lp_processing || "Processing audio..."}</span>
                                <span style={{ color: 'var(--lp-primary)' }}>98% Complete</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="lp-features">
                    <div className="feature-card">
                        <div className="lp-icon">⚡</div>
                        <h3>{t.lp_instantTranscription || "Instant Transcription"}</h3>
                        <p className="feature-text">{t.lp_instantTranscriptionDesc || "Upload audio or video and get perfectly formatted text in seconds using our advanced AI engine."}</p>
                    </div>
                    <div className="feature-card">
                        <div className="lp-icon">🧠</div>
                        <h3>{t.lp_smartSummaries || "Smart Summaries"}</h3>
                        <p className="feature-text">{t.lp_smartSummariesDesc || "Get concise executive summaries, bullet points, and key takeaways without lifting a finger."}</p>
                    </div>
                    <div className="feature-card">
                        <div className="lp-icon">✅</div>
                        <h3>{t.lp_actionItems || "Action Items"}</h3>
                        <p className="feature-text">{t.lp_actionItemsDesc || "Automatically detect tasks, deadlines, and assignees from your conversation history."}</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default LandingPage;
