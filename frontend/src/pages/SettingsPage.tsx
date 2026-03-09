import { useState, useRef, useEffect } from 'react';
import { backupApi, BackupInfo, BackupSettings } from '../api';
import { useLanguage, Language } from '../i18n';
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
    Folder,
    Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';

function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function SettingsPage() {
    const { t, language, setLanguage } = useLanguage();
    const [backups, setBackups] = useState<BackupInfo[]>([]);
    const [settings, setSettings] = useState<BackupSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [newDirectory, setNewDirectory] = useState('');
    const [editingDirectory, setEditingDirectory] = useState(false);
    const fileInputDbRef = useRef<HTMLInputElement>(null);
    const fileInputJsonRef = useRef<HTMLInputElement>(null);

    const dateLocale = language === 'pt-BR' ? ptBR : enUS;

    const formatDate = (timestamp: number): string => {
        const pattern = language === 'pt-BR'
            ? "dd 'de' MMMM 'às' HH:mm"
            : "MMMM dd 'at' HH:mm";
        return format(new Date(timestamp), pattern, { locale: dateLocale });
    };

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
            showMessage('error', t.messages.errorLoading);
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
            showMessage('success', `${t.messages.backupCreated}: ${result.name}`);
            loadData();
        } catch {
            showMessage('error', t.messages.errorSaving);
        }
    };

    const handleDeleteBackup = async (name: string) => {
        if (!confirm(t.settings.backups.confirmDelete.replace('$1', name))) return;
        try {
            await backupApi.delete(name);
            showMessage('success', t.messages.backupDeleted);
            loadData();
        } catch {
            showMessage('error', t.messages.errorSaving);
        }
    };

    const handleRestoreBackup = async (name: string) => {
        if (!confirm(t.settings.backups.confirmRestore.replace('$1', name))) return;
        try {
            await backupApi.restore(name);
            showMessage('success', t.messages.backupRestored);
            loadData();
        } catch {
            showMessage('error', t.messages.errorSaving);
        }
    };

    const handleExport = () => {
        window.location.href = backupApi.exportDatabase();
    };

    const handleExportJson = () => {
        window.location.href = backupApi.exportDatabaseJson();
    };

    const handleImportDb = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm(t.settings.backups.confirmRestore.replace('$1', file.name))) {
            e.target.value = '';
            return;
        }

        try {
            await backupApi.importDatabase(file);
            showMessage('success', t.messages.databaseImported);
            loadData();
        } catch {
            showMessage('error', t.messages.errorSaving);
        }
        e.target.value = '';
    };

    const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm(t.settings.backups.confirmRestore.replace('$1', file.name))) {
            e.target.value = '';
            return;
        }

        try {
            await backupApi.importDatabaseJson(file);
            showMessage('success', t.messages.databaseImported);
            loadData();
        } catch {
            showMessage('error', t.messages.errorSaving);
        }
        e.target.value = '';
    };

    const handleToggleAutoBackup = async () => {
        if (!settings) return;
        try {
            const updated = await backupApi.setAutoBackup(!settings.autoBackupEnabled);
            setSettings(updated);
            showMessage('success', t.messages.settingsSaved);
        } catch {
            showMessage('error', t.messages.errorSaving);
        }
    };

    const handleIntervalChange = async (hours: number) => {
        try {
            const updated = await backupApi.setInterval(hours);
            setSettings(updated);
            showMessage('success', t.messages.settingsSaved);
        } catch {
            showMessage('error', t.messages.errorSaving);
        }
    };

    const handleSaveDirectory = async () => {
        if (!newDirectory.trim()) {
            showMessage('error', t.messages.errorSaving);
            return;
        }
        try {
            const updated = await backupApi.setDirectory(newDirectory.trim());
            setSettings(updated);
            setEditingDirectory(false);
            showMessage('success', t.messages.settingsSaved);
            loadData();
        } catch {
            showMessage('error', t.messages.errorSaving);
        }
    };

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
        showMessage('success', t.messages.settingsSaved);
    };

    return (
        <div className="settings-page">
            <div className="settings-page-header">
                <h1 style={{ fontSize: '1.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Settings size={28} />
                    {t.settings.title}
                </h1>
            </div>

            {message && (
                <div className={`settings-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="settings-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Globe size={18} style={{ marginRight: '8px' }} />
                            {t.settings.language.title}
                        </h3>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {t.settings.language.description}
                    </p>

                    <div className="settings-inline-actions">
                        <button
                            className={`btn ${language === 'pt-BR' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => handleLanguageChange('pt-BR')}
                        >
                            🇧🇷 {t.settings.language.portuguese}
                        </button>
                        <button
                            className={`btn ${language === 'en' ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => handleLanguageChange('en')}
                        >
                            🇺🇸 {t.settings.language.english}
                        </button>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <HardDrive size={18} style={{ marginRight: '8px' }} />
                            {t.settings.database.title}
                        </h3>
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        {t.settings.database.description}
                    </p>

                    <div className="settings-transfer-grid">
                        <div className="settings-transfer-card">
                            <div className="settings-transfer-title">Banco completo (.db)</div>
                            <div className="settings-inline-actions">
                                <button className="btn btn-primary" onClick={handleExport}>
                                    <Download size={16} />
                                    {t.settings.database.exportDb}
                                </button>
                                <button className="btn btn-ghost" onClick={() => fileInputDbRef.current?.click()}>
                                    <Upload size={16} />
                                    {t.settings.database.importDb}
                                </button>
                            </div>
                        </div>
                        <div className="settings-transfer-card">
                            <div className="settings-transfer-title">Dados (.json)</div>
                            <div className="settings-inline-actions">
                                <button className="btn btn-primary" onClick={handleExportJson}>
                                    <Download size={16} />
                                    {t.settings.database.exportJson}
                                </button>
                                <button className="btn btn-ghost" onClick={() => fileInputJsonRef.current?.click()}>
                                    <Upload size={16} />
                                    {t.settings.database.importJson}
                                </button>
                            </div>
                        </div>
                    </div>
                    <input
                        ref={fileInputDbRef}
                        type="file"
                        accept=".db"
                        style={{ display: 'none' }}
                        onChange={handleImportDb}
                    />
                    <input
                        ref={fileInputJsonRef}
                        type="file"
                        accept=".json,application/json"
                        style={{ display: 'none' }}
                        onChange={handleImportJson}
                    />
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Clock size={18} style={{ marginRight: '8px' }} />
                            {t.settings.autoBackup.title}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : settings && (
                        <div className="settings-stack">
                            <div className="settings-row-between">
                                <div>
                                    <div style={{ fontWeight: 500 }}>{t.settings.autoBackup.daily}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        {t.settings.autoBackup.dailyDescription}
                                    </div>
                                </div>
                                <button
                                    className={`btn ${settings.autoBackupEnabled ? 'btn-success' : 'btn-ghost'}`}
                                    onClick={handleToggleAutoBackup}
                                    style={{ minWidth: '100px' }}
                                >
                                    {settings.autoBackupEnabled ? t.settings.autoBackup.enabled : t.settings.autoBackup.disabled}
                                </button>
                            </div>

                            <div>
                                <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{t.settings.autoBackup.interval}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    {t.settings.autoBackup.intervalDescription}
                                </div>
                                <div className="settings-inline-actions">
                                    <button
                                        className={`btn ${settings.backupIntervalHours === 1 ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => handleIntervalChange(1)}
                                    >
                                        {t.settings.autoBackup.hourly}
                                    </button>
                                    <button
                                        className={`btn ${settings.backupIntervalHours === 4 ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => handleIntervalChange(4)}
                                    >
                                        {t.settings.autoBackup.every4Hours}
                                    </button>
                                    <button
                                        className={`btn ${settings.backupIntervalHours === 24 ? 'btn-primary' : 'btn-ghost'}`}
                                        onClick={() => handleIntervalChange(24)}
                                    >
                                        {t.settings.autoBackup.daily24h}
                                    </button>
                                </div>
                            </div>

                            <div className="settings-muted-row">
                                <Shield size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                {settings.maxBackups} {t.settings.autoBackup.maxBackups}
                            </div>
                        </div>
                    )}
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Folder size={18} style={{ marginRight: '8px' }} />
                            {t.settings.backupDirectory.title}
                        </h3>
                    </div>

                    {loading ? (
                        <div className="loading"><div className="spinner"></div></div>
                    ) : settings && (
                        <div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                {t.settings.backupDirectory.description}
                            </p>

                            {editingDirectory ? (
                                <div className="settings-inline-actions">
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={newDirectory}
                                        onChange={(e) => setNewDirectory(e.target.value)}
                                        placeholder="/path/to/backups"
                                        style={{ flex: 1 }}
                                    />
                                    <button className="btn btn-primary" onClick={handleSaveDirectory}>
                                        <Save size={16} />
                                        {t.common.save}
                                    </button>
                                    <button className="btn btn-ghost" onClick={() => {
                                        setEditingDirectory(false);
                                        setNewDirectory(settings.backupDirectory);
                                    }}>
                                        {t.common.cancel}
                                    </button>
                                </div>
                            ) : (
                                <div className="settings-inline-actions">
                                    <code className="settings-code-path">
                                        {settings.backupDirectory}
                                    </code>
                                    <button className="btn btn-ghost" onClick={() => setEditingDirectory(true)}>
                                        {t.settings.backupDirectory.change}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="card settings-backups-card">
                <div className="card-header">
                    <h3 className="card-title">
                        <Save size={18} style={{ marginRight: '8px' }} />
                        {t.settings.backups.title} ({backups.length}/5)
                    </h3>
                    <div className="settings-inline-actions">
                        <button className="btn btn-icon btn-ghost" onClick={loadData} title="Refresh">
                            <RefreshCw size={16} />
                        </button>
                        <button className="btn btn-primary" onClick={handleCreateBackup}>
                            <Save size={16} />
                            {t.settings.backups.createBackup}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading"><div className="spinner"></div></div>
                ) : backups.length === 0 ? (
                    <div className="empty-state">
                        <p>{t.settings.backups.noBackups}</p>
                        <p style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
                            {t.settings.backups.createFirst}
                        </p>
                    </div>
                ) : (
                    <div className="settings-backup-list">
                        {backups.map((backup) => (
                            <div key={backup.name} className="settings-backup-row">
                                <div className="settings-backup-icon">
                                    <HardDrive size={20} />
                                </div>
                                <div className="settings-backup-info">
                                    <div className="settings-backup-name">{backup.name}</div>
                                    <div className="settings-backup-meta">
                                        <span>{formatDate(backup.created)}</span>
                                        <span>•</span>
                                        <span>{formatBytes(backup.size)}</span>
                                    </div>
                                </div>
                                <div className="settings-inline-actions">
                                    <button
                                        className="btn btn-ghost"
                                        onClick={() => handleRestoreBackup(backup.name)}
                                        title={t.settings.backups.restore}
                                        style={{ fontSize: '0.75rem' }}
                                    >
                                        <RefreshCw size={14} />
                                        {t.settings.backups.restore}
                                    </button>
                                    <button
                                        className="btn btn-icon btn-ghost"
                                        onClick={() => handleDeleteBackup(backup.name)}
                                        title={t.common.delete}
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
