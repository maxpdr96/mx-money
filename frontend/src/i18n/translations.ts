export type Language = 'pt-BR' | 'en';

export interface Translations {
    // Navigation
    nav: {
        dashboard: string;
        transactions: string;
        calendar: string;
        search: string;
        projection: string;
        simulator: string;
        recurring: string;
        settings: string;
    };

    // Common
    common: {
        save: string;
        cancel: string;
        delete: string;
        edit: string;
        create: string;
        loading: string;
        error: string;
        success: string;
        confirm: string;
        yes: string;
        no: string;
        actions: string;
        noData: string;
        search: string;
        clear: string;
    };

    // Dashboard
    dashboard: {
        title: string;
        newTransaction: string;
        currentBalance: string;
        income: string;
        expenses: string;
        latestTransactions: string;
        spendingByCategory: string;
    };

    // Transactions
    transactions: {
        title: string;
        form: {
            title: string;
            editTitle: string;
            type: string;
            income: string;
            expense: string;
            description: string;
            descriptionPlaceholder: string;
            amount: string;
            effectiveDate: string;
            category: string;
            noCategory: string;
            recurrence: string;
            none: string;
            daily: string;
            weekly: string;
            monthly: string;
            yearly: string;
            endDate: string;
            endDateHint: string;
            saving: string;
            update: string;
        };
        confirmDelete: string;
        totalIncome: string;
        totalExpenses: string;
        results: string;
        searchPlaceholder: string;
        noResults: string;
        tryAnother: string;
        typeToSearch: string;
        searchHint: string;
    };

    // Projection
    projection: {
        title: string;
        days: string;
        currentBalance: string;
        projectedBalance: string;
        chart: string;
    };

    // Recurring
    recurring: {
        title: string;
        noRecurring: string;
        createFirst: string;
    };

    // Reports
    reports: {
        title: string;
        description: string;
        generate: string;
        generating: string;
        lastGenerated: string;
        noAnalysis: string;
        instructions: string;
        errorOllama: string;
    };

    // Settings
    settings: {
        title: string;
        language: {
            title: string;
            description: string;
            portuguese: string;
            english: string;
        };
        database: {
            title: string;
            description: string;
            export: string;
            import: string;
        };
        autoBackup: {
            title: string;
            daily: string;
            dailyDescription: string;
            enabled: string;
            disabled: string;
            maxBackups: string;
        };
        backupDirectory: {
            title: string;
            description: string;
            change: string;
        };
        backups: {
            title: string;
            createBackup: string;
            restore: string;
            noBackups: string;
            createFirst: string;
            confirmRestore: string;
            confirmDelete: string;
        };
    };

    // Categories
    categories: {
        title: string;
        newCategory: string;
        editCategory: string;
        name: string;
        color: string;
        confirmDelete: string;
    };

    // Messages
    messages: {
        backupCreated: string;
        backupDeleted: string;
        backupRestored: string;
        databaseExported: string;
        databaseImported: string;
        settingsSaved: string;
        transactionCreated: string;
        transactionUpdated: string;
        transactionDeleted: string;
        categoryCreated: string;
        categoryUpdated: string;
        categoryDeleted: string;
        errorLoading: string;
        errorSaving: string;
    };
}

export const translations: Record<Language, Translations> = {
    'pt-BR': {
        nav: {
            dashboard: 'Dashboard',
            transactions: 'Transações',
            calendar: 'Calendário',
            search: 'Buscar',
            projection: 'Projeção',
            simulator: 'Simulador',
            recurring: 'Recorrentes',
            settings: 'Configurações',
        },
        common: {
            save: 'Salvar',
            cancel: 'Cancelar',
            delete: 'Excluir',
            edit: 'Editar',
            create: 'Criar',
            loading: 'Carregando...',
            error: 'Erro',
            success: 'Sucesso',
            confirm: 'Confirmar',
            yes: 'Sim',
            no: 'Não',
            actions: 'Ações',
            noData: 'Nenhum dado encontrado',
            search: 'Buscar',
            clear: 'Limpar',
        },
        dashboard: {
            title: 'Dashboard',
            newTransaction: 'Nova Transação',
            currentBalance: 'Saldo Atual',
            income: 'Receitas',
            expenses: 'Despesas',
            latestTransactions: 'Últimas Transações',
            spendingByCategory: 'Gastos por Categoria',
        },
        transactions: {
            title: 'Transações',
            form: {
                title: 'Nova Transação',
                editTitle: 'Editar Transação',
                type: 'Tipo',
                income: 'Receita',
                expense: 'Despesa',
                description: 'Descrição',
                descriptionPlaceholder: 'Ex: Almoço, Salário, Conta de luz...',
                amount: 'Valor (R$)',
                effectiveDate: 'Data Efetiva',
                category: 'Categoria',
                noCategory: 'Sem categoria',
                recurrence: 'Recorrência',
                none: 'Não repete',
                daily: 'Diária',
                weekly: 'Semanal',
                monthly: 'Mensal',
                yearly: 'Anual',
                endDate: 'Data Final (opcional)',
                endDateHint: 'Deixe vazio para repetir indefinidamente',
                saving: 'Salvando...',
                update: 'Atualizar',
            },
            confirmDelete: 'Tem certeza que deseja excluir esta transação?',
            totalIncome: 'Total Receitas',
            totalExpenses: 'Total Despesas',
            results: 'Resultados',
            searchPlaceholder: 'Digite para buscar... (ex: aluguel, água, salário)',
            noResults: 'Nenhuma transação encontrada',
            tryAnother: 'Tente buscar por outro termo',
            typeToSearch: 'Digite algo para buscar',
            searchHint: 'A busca encontra transações por descrição, ignorando acentos e maiúsculas/minúsculas',
        },
        projection: {
            title: 'Projeção de Saldo',
            days: 'dias',
            currentBalance: 'Saldo Atual',
            projectedBalance: 'Saldo Projetado',
            chart: 'Gráfico de Projeção',
        },
        recurring: {
            title: 'Transações Recorrentes',
            noRecurring: 'Nenhuma transação recorrente',
            createFirst: 'Crie uma transação com recorrência para visualizar aqui',
        },
        reports: {
            title: 'Relatórios IA',
            description: 'Análise inteligente das suas finanças usando IA',
            generate: 'Gerar Análise',
            generating: 'Gerando análise...',
            lastGenerated: 'Gerado em',
            noAnalysis: 'Nenhuma análise gerada ainda',
            instructions: 'Clique no botão acima para gerar uma análise detalhada das suas finanças',
            errorOllama: 'Erro ao conectar com Ollama. Verifique se está rodando.',
        },
        settings: {
            title: 'Configurações',
            language: {
                title: 'Idioma',
                description: 'Escolha o idioma da interface',
                portuguese: 'Português',
                english: 'Inglês',
            },
            database: {
                title: 'Banco de Dados',
                description: 'Exporte seu banco de dados para backup externo ou importe um arquivo existente.',
                export: 'Exportar',
                import: 'Importar',
            },
            autoBackup: {
                title: 'Backup Automático',
                daily: 'Backup diário',
                dailyDescription: 'Cria backup automaticamente à meia-noite',
                enabled: 'Ativado',
                disabled: 'Desativado',
                maxBackups: 'backups mantidos (mais antigos são removidos)',
            },
            backupDirectory: {
                title: 'Diretório de Backups',
                description: 'Escolha onde os backups serão salvos. Use um caminho absoluto.',
                change: 'Alterar',
            },
            backups: {
                title: 'Backups Salvos',
                createBackup: 'Criar Backup',
                restore: 'Restaurar',
                noBackups: 'Nenhum backup encontrado',
                createFirst: 'Clique em "Criar Backup" para criar o primeiro',
                confirmRestore: 'Restaurar banco a partir de "$1"? Isso substituirá todos os dados atuais.',
                confirmDelete: 'Excluir backup "$1"?',
            },
        },
        categories: {
            title: 'Categorias',
            newCategory: 'Nova Categoria',
            editCategory: 'Editar Categoria',
            name: 'Nome',
            color: 'Cor',
            confirmDelete: 'Tem certeza que deseja excluir esta categoria?',
        },
        messages: {
            backupCreated: 'Backup criado',
            backupDeleted: 'Backup excluído',
            backupRestored: 'Banco restaurado. Recarregue a página.',
            databaseExported: 'Banco exportado',
            databaseImported: 'Banco importado. Recarregue a página.',
            settingsSaved: 'Configuração salva',
            transactionCreated: 'Transação criada',
            transactionUpdated: 'Transação atualizada',
            transactionDeleted: 'Transação excluída',
            categoryCreated: 'Categoria criada',
            categoryUpdated: 'Categoria atualizada',
            categoryDeleted: 'Categoria excluída',
            errorLoading: 'Erro ao carregar dados',
            errorSaving: 'Erro ao salvar',
        },
    },
    'en': {
        nav: {
            dashboard: 'Dashboard',
            transactions: 'Transactions',
            calendar: 'Calendar',
            search: 'Search',
            projection: 'Projection',
            simulator: 'Simulator',
            recurring: 'Recurring',
            settings: 'Settings',
        },
        common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            create: 'Create',
            loading: 'Loading...',
            error: 'Error',
            success: 'Success',
            confirm: 'Confirm',
            yes: 'Yes',
            no: 'No',
            actions: 'Actions',
            noData: 'No data found',
            search: 'Search',
            clear: 'Clear',
        },
        dashboard: {
            title: 'Dashboard',
            newTransaction: 'New Transaction',
            currentBalance: 'Current Balance',
            income: 'Income',
            expenses: 'Expenses',
            latestTransactions: 'Latest Transactions',
            spendingByCategory: 'Spending by Category',
        },
        transactions: {
            title: 'Transactions',
            form: {
                title: 'New Transaction',
                editTitle: 'Edit Transaction',
                type: 'Type',
                income: 'Income',
                expense: 'Expense',
                description: 'Description',
                descriptionPlaceholder: 'E.g.: Lunch, Salary, Electric bill...',
                amount: 'Amount ($)',
                effectiveDate: 'Effective Date',
                category: 'Category',
                noCategory: 'No category',
                recurrence: 'Recurrence',
                none: 'Does not repeat',
                daily: 'Daily',
                weekly: 'Weekly',
                monthly: 'Monthly',
                yearly: 'Yearly',
                endDate: 'End Date (optional)',
                endDateHint: 'Leave empty to repeat indefinitely',
                saving: 'Saving...',
                update: 'Update',
            },
            confirmDelete: 'Are you sure you want to delete this transaction?',
            totalIncome: 'Total Income',
            totalExpenses: 'Total Expenses',
            results: 'Results',
            searchPlaceholder: 'Type to search... (e.g.: rent, water, salary)',
            noResults: 'No transactions found',
            tryAnother: 'Try searching for another term',
            typeToSearch: 'Type something to search',
            searchHint: 'Search finds transactions by description, ignoring accents and case',
        },
        projection: {
            title: 'Balance Projection',
            days: 'days',
            currentBalance: 'Current Balance',
            projectedBalance: 'Projected Balance',
            chart: 'Projection Chart',
        },
        recurring: {
            title: 'Recurring Transactions',
            noRecurring: 'No recurring transactions',
            createFirst: 'Create a transaction with recurrence to view here',
        },
        reports: {
            title: 'AI Reports',
            description: 'Intelligent analysis of your finances using AI',
            generate: 'Generate Analysis',
            generating: 'Generating analysis...',
            lastGenerated: 'Generated at',
            noAnalysis: 'No analysis generated yet',
            instructions: 'Click the button above to generate a detailed analysis of your finances',
            errorOllama: 'Error connecting to Ollama. Check if it is running.',
        },
        settings: {
            title: 'Settings',
            language: {
                title: 'Language',
                description: 'Choose the interface language',
                portuguese: 'Portuguese',
                english: 'English',
            },
            database: {
                title: 'Database',
                description: 'Export your database for external backup or import an existing file.',
                export: 'Export',
                import: 'Import',
            },
            autoBackup: {
                title: 'Automatic Backup',
                daily: 'Daily backup',
                dailyDescription: 'Creates backup automatically at midnight',
                enabled: 'Enabled',
                disabled: 'Disabled',
                maxBackups: 'backups kept (older ones are removed)',
            },
            backupDirectory: {
                title: 'Backup Directory',
                description: 'Choose where backups will be saved. Use an absolute path.',
                change: 'Change',
            },
            backups: {
                title: 'Saved Backups',
                createBackup: 'Create Backup',
                restore: 'Restore',
                noBackups: 'No backups found',
                createFirst: 'Click "Create Backup" to create the first one',
                confirmRestore: 'Restore database from "$1"? This will replace all current data.',
                confirmDelete: 'Delete backup "$1"?',
            },
        },
        categories: {
            title: 'Categories',
            newCategory: 'New Category',
            editCategory: 'Edit Category',
            name: 'Name',
            color: 'Color',
            confirmDelete: 'Are you sure you want to delete this category?',
        },
        messages: {
            backupCreated: 'Backup created',
            backupDeleted: 'Backup deleted',
            backupRestored: 'Database restored. Please reload the page.',
            databaseExported: 'Database exported',
            databaseImported: 'Database imported. Please reload the page.',
            settingsSaved: 'Setting saved',
            transactionCreated: 'Transaction created',
            transactionUpdated: 'Transaction updated',
            transactionDeleted: 'Transaction deleted',
            categoryCreated: 'Category created',
            categoryUpdated: 'Category updated',
            categoryDeleted: 'Category deleted',
            errorLoading: 'Error loading data',
            errorSaving: 'Error saving',
        },
    },
};
