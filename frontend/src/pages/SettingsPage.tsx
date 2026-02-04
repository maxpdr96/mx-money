import { useState, useRef, useEffect } from 'react';
import { backupApi, BackupInfo, BackupSettings } from '../api';
import {
    Settings,
    Download,
    Upload,
    Save,
    Trash2,
    RefreshCw,
    HardDrive,
    Clock,
    Shield,
    Folder
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(timestamp: number): string {
    return format(new Date(timestamp), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
}

export function SettingsPage() {
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [settings, setSettings] = useState<BackupSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [newDirectory, setNewDirectory] = useState('');
    const [editingDirectory, setEditingDirectory] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [backupList, backupSettings] = await Promise.all([
                backupApi.list(),
                backupApi.getSettings(),
            ]);
            setBackups(backupList);
            setSettings(backupSettings);
            setNewDirectory(backupSettings.backupDirectory);
        } catch {
            showMessage('error', 'Erro ao carregar dados');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 4000);
    };

    const handleCreateBackup = async () => {
        try {
            const result = await backupApi.create();
            showMessage('success', `Backup criado: ${result.name}`);
            loadData();
        } catch {
            showMessage('error', 'Erro ao criar backup');
        }
    };

    const handleDeleteBackup = async (name: string) => {
        if (!confirm(`Excluir backup "${name}"?`)) return;
        try {
            await backupApi.delete(name);
            showMessage('success', 'Backup excluído');
            loadData();
        } catch {
            showMessage('error', 'Erro ao excluir backup');
        }
    };

    const handleRestoreBackup = async (name: string) => {
        if (!confirm(`Restaurar banco a partir de "${name}"? Isso substituirá todos os dados atuais.`)) return;
        try {
            await backupApi.restore(name);
            showMessage('success', 'Banco restaurado. Recarregue a página.');
            loadData();
        } catch {
            showMessage('error', 'Erro ao restaurar backup');
        }
    };

    const handleExport = () => {
        window.location.href = backupApi.exportDatabase();
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm('Importar este banco de dados? Isso substituirá todos os dados atuais.')) {
            e.target.value = '';
            return;
        }

        try {
            await backupApi.importDatabase(file);
            showMessage('success', 'Banco importado. Recarregue a página.');
            loadData();
        } catch {
            showMessage('error', 'Erro ao importar banco');
        }
        e.target.value = '';
    };

    const handleToggleAutoBackup = async () => {
        if (!settings) return;
        try {
            const updated = await backupApi.setAutoBackup(!settings.autoBackupEnabled);
            setSettings(updated);
            showMessage('success', `Backup automático ${updated.autoBackupEnabled ? 'ativado' : 'desativado'}`);
        } catch {
            showMessage('error', 'Erro ao alterar configuração');
        }
    };

    const handleSaveDirectory = async () => {
        if (!newDirectory.trim()) {
            showMessage('error', 'Digite um caminho válido');
            return;
        }
        try {
            const updated = await backupApi.setDirectory(newDirectory.trim());
            setSettings(updated);
            setEditingDirectory(false);
            showMessage('success', 'Diretório de backup alterado');
            loadData();
        } catch {
            showMessage('error', 'Erro ao alterar diretório');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={28} />
                    Configurações
                </h1>
            </div>

            {/* Message */}
            {message && (
                <div
                    style={{
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        background: message.type === 'success' ? 'var(--color-success-light)' : 'var(--color-danger-light)',
                        color: message.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                        fontWeight: 500,
                    }}
                >
                    {message.text}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Export/Import Section */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <HardDrive size={18} style={{ marginRight: '8px' }} />
                            Banco de Dados
                        </h3>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Exporte seu banco de dados para backup externo ou importe um arquivo existente.
                    </p>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button className="btn btn-primary" onClick={handleExport}>
                            <Download size={16} />
                            Exportar
                        </button>
                        <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
                            <Upload size={16} />
                            Importar
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".db"
                            style={{ display: 'none' }}
                            onChange={handleImport}
                        />
                    </div>
                </div>

                {/* Auto Backup Settings */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Clock size={18} style={{ marginRight: '8px' }} />
                            Backup Automático
                        </h3>
                    </div>

                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : settings && (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: 500 }}>Backup diário</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Cria backup automaticamente à meia-noite
                                    </div>
                                </div>
                                <button
                                    className={`btn ${settings.autoBackupEnabled ? 'btn-success' : 'btn-ghost'}`}
                                    onClick={handleToggleAutoBackup}
                                    style={{ minWidth: '100px' }}
                                >
                                    {settings.autoBackupEnabled ? 'Ativado' : 'Desativado'}
                                </button>
                            </div>

                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                Máximo de {settings.maxBackups} backups mantidos (mais antigos são removidos)
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Backup Directory */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                    <h3 className="card-title">
                        <Folder size={18} style={{ marginRight: '8px' }} />
                        Diretório de Backups
                    </h3>
                </div>

                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : settings && (
                    <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Escolha onde os backups serão salvos. Use um caminho absoluto.
                        </p>

                        {editingDirectory ? (
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={newDirectory}
                                    onChange={(e) => setNewDirectory(e.target.value)}
                                    placeholder="/caminho/para/backups"
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary" onClick={handleSaveDirectory}>
                                    <Save size={16} />
                                    Salvar
                                </button>
                                <button className="btn btn-ghost" onClick={() => {
                                    setEditingDirectory(false);
                                    setNewDirectory(settings.backupDirectory);
                                }}>
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <code style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'var(--surface-secondary)',
                                    borderRadius: '8px',
                                    fontSize: '0.875rem',
                                    wordBreak: 'break-all'
                                }}>
                                    {settings.backupDirectory}
                                </code>
                                <button className="btn btn-ghost" onClick={() => setEditingDirectory(true)}>
                                    Alterar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Backups List */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                    <h3 className="card-title">
                        <Save size={18} style={{ marginRight: '8px' }} />
                        Backups Salvos ({backups.length}/5)
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-icon btn-ghost" onClick={loadData} title="Atualizar">
                            <RefreshCw size={16} />
                        </button>
                        <button className="btn btn-primary" onClick={handleCreateBackup}>
                            <Save size={16} />
                            Criar Backup
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : backups.length === 0 ? (
                    <div className="empty-state">
                        <p>Nenhum backup encontrado</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            Clique em "Criar Backup" para criar o primeiro
                        </p>
                    </div>
                ) : (
                    <div className="transaction-list">
                        {backups.map((backup) => (
                            <div key={backup.name} className="transaction-item">
                                <div className="transaction-icon" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                    <HardDrive size={20} />
                                </div>
                                <div className="transaction-info">
                                    <div className="transaction-description">{backup.name}</div>
                                    <div className="transaction-meta">
                                        <span>{formatDate(backup.created)}</span>
                                        <span>•</span>
                                        <span>{formatBytes(backup.size)}</span>
                                    </div>
                                </div>
                                <div className="transaction-actions" style={{ opacity: 1 }}>
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => handleRestoreBackup(backup.name)}
                                        title="Restaurar"
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        <RefreshCw size={14} />
                                        Restaurar
                                    </button>
                                    <button
                                        className="btn btn-icon btn-ghost"
                                        onClick={() => handleDeleteBackup(backup.name)}
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
