import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translations, translations } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mx-money-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'pt-BR' || saved === 'en') {
            return saved;
        }
        // Detect browser language
        const browserLang = navigator.language;
        return browserLang.startsWith('pt') ? 'pt-BR' : 'en';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    useEffect(() => {
        document.documentElement.setAttribute('lang', language);
    }, [language]);

    const value: LanguageContextType = {
        language,
        setLanguage,
        t: translations[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
