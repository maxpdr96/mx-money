import { useState } from 'react';
import { reportsApi, type ReportAnalysisResponse } from '../api';
import { useLanguage } from '../i18n';
import { Brain, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function ReportsPage() {
    const [analysis, setAnalysis] = useState<ReportAnalysisResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { t, language } = useLanguage();

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        try {
            const result = await reportsApi.generateAnalysis(language);
            setAnalysis(result);
        } catch (error) {
            console.error('Error generating analysis:', error);
            setAnalysis({
                success: false,
                analysis: '',
                generatedAt: new Date().toISOString(),
                errorMessage: t.reports.errorOllama,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Brain size={28} />
                    {t.reports.title}
                </h1>
                <button
                    className="btn btn-primary"
                    onClick={handleGenerateAnalysis}
                    disabled={isLoading}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                            {t.reports.generating}
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            {t.reports.generate}
                        </>
                    )}
                </button>
            </div>

            {/* Descrição */}
            <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--color-primary-light) 0%, var(--bg-secondary) 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        background: 'var(--color-primary)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Brain size={24} color="white" />
                    </div>
                    <div>
                        <h3 style={{ fontWeight: 600, marginBottom: '4px' }}>{t.reports.description}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Ollama + llama3.2
                        </p>
                    </div>
                </div>
            </div>

            {/* Análise */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} />
                        {language === 'pt-BR' ? 'Análise Financeira' : 'Financial Analysis'}
                    </h3>
                    {analysis?.generatedAt && analysis.success && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {t.reports.lastGenerated}: {new Date(analysis.generatedAt).toLocaleString(language)}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <div className="loading" style={{ padding: '3rem' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                            {t.reports.generating}
                        </p>
                    </div>
                ) : analysis ? (
                    analysis.success ? (
                        <div style={{ padding: '1rem', lineHeight: '1.8' }} className="markdown-content">
                            <ReactMarkdown>{analysis.analysis}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="empty-state" style={{ padding: '2rem' }}>
                            <AlertCircle size={48} color="var(--color-danger)" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                                {analysis.errorMessage}
                            </p>
                        </div>
                    )
                ) : (
                    <div className="empty-state" style={{ padding: '3rem' }}>
                        <Sparkles size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                        <p style={{ fontSize: '1.125rem' }}>{t.reports.noAnalysis}</p>
                        <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                            {t.reports.instructions}
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .markdown-content h1, .markdown-content h2, .markdown-content h3 {
                    margin-top: 1.5rem;
                    margin-bottom: 0.75rem;
                    font-weight: 600;
                }
                .markdown-content h1 { font-size: 1.5rem; }
                .markdown-content h2 { font-size: 1.25rem; }
                .markdown-content h3 { font-size: 1.125rem; }
                .markdown-content ul, .markdown-content ol {
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .markdown-content li {
                    margin-bottom: 0.5rem;
                }
                .markdown-content p {
                    margin-bottom: 1rem;
                }
                .markdown-content strong {
                    color: var(--color-primary);
                }
            `}</style>
        </div>
    );
}
