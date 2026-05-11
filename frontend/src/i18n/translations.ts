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
        budgets: string;
        budgetUsed: string;
        remaining: string;
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
            interval: string;
            intervalDescription: string;
            hourly: string;
            every4Hours: string;
            daily24h: string;
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
        budget: string;
        confirmDelete: string;
    };

    // CSV Import
    csvImport: {
        title: string;
        description: string;
        dragDrop: string;
        selectFile: string;
        processing: string;
        aiCategorizing: string;
        results: string;
        saveAll: string;
        saving: string;
        saved: string;
        importAnother: string;
        invalidFile: string;
        errorProcessing: string;
        errorSaving: string;
        editCategory: string;
        date: string;
        descriptionCol: string;
        amount: string;
        categoryCol: string;
    };

    // Stocks
    stocks: {
        title: string;
        newStock: string;
        editStock: string;
        ticker: string;
        tickerPlaceholder: string;
        name: string;
        sector: string;
        cnpj: string;
        cnpjPlaceholder: string;
        notes: string;
        noStocks: string;
        noStocksHint: string;
        confirmDeleteStock: string;
        quantity: string;
        avgCost: string;
        totalInvested: string;
        totalSales: string;
        realizedPL: string;
        totalDividends: string;
        totalJcp: string;
        portfolioSummary: string;
        totalInvestedAll: string;
        totalReturnAll: string;
        totalProventosAll: string;
        events: string;
        addEvent: string;
        editEvent: string;
        noEvents: string;
        noEventsHint: string;
        confirmDeleteEvent: string;
        eventType: string;
        eventDate: string;
        unitPrice: string;
        fees: string;
        splitRatio: string;
        splitRatioHint: string;
        totalValue: string;
        bonusShares: string;
        declaredValue: string;
        totalAmortization: string;
        amortPerShare: string;
        reverseSplitRatio: string;
        reverseSplitRatioHint: string;
        eventTypes: {
            BUY: string;
            SELL: string;
            DIVIDEND: string;
            JCP: string;
            SPLIT: string;
            REVERSE_SPLIT: string;
            BONUS: string;
            SUBSCRIPTION: string;
            AMORTIZATION: string;
        };
        shares: string;
        back: string;
        detail: string;
        jcpNote: string;
        jcpValueType: string;
        jcpGrossLabel: string;
        jcpNetLabel: string;
        jcpGrossHint: string;
        jcpNetHint: string;
        amortNote: string;
        taxReport: string;
        backToPortfolio: string;
        manageSectors: string;
        newSector: string;
        editSector: string;
        sectorName: string;
        sectorColor: string;
        confirmDeleteSector: string;
        noSectors: string;
        sectorSelect: string;
        sectorCustom: string;
        chartsTitle: string;
        chartSectorAlloc: string;
        chartQtyByTicker: string;
        eventsTab: string;
        proventosTab: string;
        filterAll: string;
        noProventos: string;
        proventosMonth: string;
        proventosDividends: string;
        proventosJcpGross: string;
        proventosJcpIrrf: string;
        proventosJcpNet: string;
        proventosAmort: string;
        proventosTotal: string;
    };

    // Tax Report
    taxReport: {
        title: string;
        subtitle: string;
        year: string;
        summary: string;
        totalTaxDue: string;
        lossCarriedForward: string;
        totalDividendsIsentos: string;
        totalJcpGross: string;
        totalJcpIrrf: string;
        totalAmortization: string;
        noTaxDue: string;
        sec1Title: string;
        sec1Code: string;
        sec1Hint: string;
        sec1PrevYear: string;
        sec1CurrYear: string;
        sec1AvgCost: string;
        sec1TotalCost: string;
        sec1Qty: string;
        sec1Empty: string;
        sec2Title: string;
        sec2Code: string;
        sec2Hint: string;
        sec2Empty: string;
        sec3Title: string;
        sec3Code: string;
        sec3Hint: string;
        sec3GrossValue: string;
        sec3IrrfRetained: string;
        sec3NetReceived: string;
        sec3Empty: string;
        sec4Title: string;
        sec4Hint: string;
        sec4Month: string;
        sec4GrossSales: string;
        sec4CostBasis: string;
        sec4Result: string;
        sec4Status: string;
        sec4LossOffset: string;
        sec4TaxableResult: string;
        sec4TaxDue: string;
        sec4DarfDue: string;
        sec4Empty: string;
        exempt: string;
        taxable: string;
        loss: string;
        lossCarryNote: string;
        exemptNote: string;
        darfNote: string;
        printBtn: string;
        amortSection: string;
        amortHint: string;
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
            budgets: 'Orçamentos',
            budgetUsed: '$1 de $2 usados',
            remaining: 'Restante',
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
                description: 'Exporte e importe seus dados em JSON (categorias e transações, incluindo recorrências).',
                export: 'Exportar JSON',
                import: 'Importar JSON',
            },
            autoBackup: {
                title: 'Backup Automático',
                daily: 'Backup automático',
                dailyDescription: 'Cria backup automaticamente no intervalo selecionado',
                enabled: 'Ativado',
                disabled: 'Desativado',
                maxBackups: 'backups mantidos (mais antigos são removidos)',
                interval: 'Intervalo de Backup',
                intervalDescription: 'Com que frequência o backup automático será criado',
                hourly: '1 hora',
                every4Hours: '4 horas',
                daily24h: '24 horas',
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
            budget: 'Orçamento Mensal (opcional)',
            confirmDelete: 'Tem certeza que deseja excluir esta categoria?',
        },
        csvImport: {
            title: 'Importar CSV',
            description: 'Importe transações de um extrato bancário CSV. A IA irá categorizar automaticamente cada transação.',
            dragDrop: 'Arraste e solte seu arquivo CSV aqui',
            selectFile: 'ou clique para selecionar',
            processing: 'Processando...',
            aiCategorizing: 'A IA está categorizando suas transações, isso pode levar alguns segundos.',
            results: 'Resultados',
            saveAll: 'Salvar Tudo',
            saving: 'Salvando...',
            saved: 'Transações importadas com sucesso!',
            importAnother: 'Importar outro',
            invalidFile: 'Arquivo inválido. Use um arquivo .csv ou .txt',
            errorProcessing: 'Erro ao processar o arquivo CSV. Verifique o formato.',
            errorSaving: 'Erro ao salvar as transações.',
            editCategory: 'Editar categoria',
            date: 'Data',
            descriptionCol: 'Descrição',
            amount: 'Valor',
            categoryCol: 'Categoria',
        },
        stocks: {
            title: 'Carteira de Ações',
            newStock: 'Nova Ação',
            editStock: 'Editar Ação',
            ticker: 'Ticker',
            tickerPlaceholder: 'Ex: PETR4, VALE3, ITUB4',
            name: 'Nome da Empresa',
            sector: 'Setor',
            cnpj: 'CNPJ',
            cnpjPlaceholder: '00.000.000/0000-00',
            notes: 'Observações',
            noStocks: 'Nenhuma ação cadastrada',
            noStocksHint: 'Clique em "Nova Ação" para começar',
            confirmDeleteStock: 'Excluir ação e todos os seus eventos?',
            quantity: 'Quantidade',
            avgCost: 'Preço Médio',
            totalInvested: 'Total Investido',
            totalSales: 'Total Vendas',
            realizedPL: 'Resultado Realizado',
            totalDividends: 'Dividendos',
            totalJcp: 'JCP',
            totalAmortization: 'Amortização',
            amortPerShare: 'Valor Amortizado por Ação (R$)',
            reverseSplitRatio: 'Fator de Grupamento',
            reverseSplitRatioHint: 'Ex: 10 = cada 10 ações viram 1; 4 = cada 4 viram 1',
            portfolioSummary: 'Resumo do Portfólio',
            totalInvestedAll: 'Total Investido',
            totalReturnAll: 'Resultado Total',
            totalProventosAll: 'Proventos (Div + JCP)',
            events: 'Histórico de Eventos',
            addEvent: 'Adicionar Evento',
            editEvent: 'Editar Evento',
            noEvents: 'Nenhum evento registrado',
            noEventsHint: 'Adicione compras, vendas, dividendos e outros eventos',
            confirmDeleteEvent: 'Excluir este evento?',
            eventType: 'Tipo de Evento',
            eventDate: 'Data',
            unitPrice: 'Preço por Ação (R$)',
            fees: 'Corretagem / Taxas (R$)',
            splitRatio: 'Fator de Desdobramento',
            splitRatioHint: 'Ex: 2 = 1 ação vira 2; 3 = 1 ação vira 3',
            totalValue: 'Valor Total Recebido (R$)',
            bonusShares: 'Ações Bonificadas Recebidas',
            declaredValue: 'Valor Patrimonial por Ação (R$)',
            eventTypes: {
                BUY: 'Compra',
                SELL: 'Venda',
                DIVIDEND: 'Dividendo',
                JCP: 'JCP',
                SPLIT: 'Desdobramento',
                REVERSE_SPLIT: 'Grupamento',
                BONUS: 'Bonificação',
                SUBSCRIPTION: 'Subscrição',
                AMORTIZATION: 'Amortização',
            },
            shares: 'ações',
            back: 'Voltar ao portfólio',
            detail: 'Detalhes',
            jcpNote: 'Valor bruto (17,5% IRRF retido na fonte)',
            jcpValueType: 'O valor informado é',
            jcpGrossLabel: 'Bruto (antes do IRRF)',
            jcpNetLabel: 'Líquido (já descontado o IRRF)',
            jcpGrossHint: 'O sistema calcula 17,5% de IRRF sobre este valor.',
            jcpNetHint: 'O sistema converte para bruto automaticamente (÷ 0,825) para o cálculo do IRRF.',
            amortNote: 'Reduz o preço médio; devolução de capital não tributada (até PM = 0)',
            taxReport: 'Relatório IR',
            backToPortfolio: 'Voltar ao portfólio',
            eventsTab: 'Histórico de Eventos',
            proventosTab: 'Proventos por Mês',
            filterAll: 'Todos',
            noProventos: 'Nenhum provento registrado',
            proventosMonth: 'Mês',
            proventosDividends: 'Dividendos',
            proventosJcpGross: 'JCP Bruto',
            proventosJcpIrrf: 'IRRF (17,5%)',
            proventosJcpNet: 'JCP Líquido',
            proventosAmort: 'Amortização',
            proventosTotal: 'Total Recebido',
            manageSectors: 'Gerenciar Setores',
            newSector: 'Novo Setor',
            editSector: 'Editar Setor',
            sectorName: 'Nome do Setor',
            sectorColor: 'Cor',
            confirmDeleteSector: 'Excluir este setor? As ações que usam este setor manterão o nome.',
            noSectors: 'Nenhum setor cadastrado',
            sectorSelect: 'Selecionar setor',
            sectorCustom: 'Digitar manualmente',
            chartsTitle: 'Gráficos do Portfólio',
            chartSectorAlloc: 'Alocação por Setor (%)',
            chartQtyByTicker: 'Quantidade por Ação',
        },
        taxReport: {
            title: 'Relatório de Imposto de Renda',
            subtitle: 'Resumo anual para declaração no IRPF',
            year: 'Ano-calendário',
            summary: 'Resumo do Ano',
            totalTaxDue: 'IR a Pagar (Renda Variável)',
            lossCarriedForward: 'Prejuízo a Compensar (anos futuros)',
            totalDividendsIsentos: 'Dividendos Isentos',
            totalJcpGross: 'JCP Bruto Recebido',
            totalJcpIrrf: 'IRRF Retido no JCP (15%)',
            totalAmortization: 'Amortização Recebida',
            noTaxDue: 'Nenhum IR devido em Renda Variável neste ano.',
            sec1Title: 'Seção 1 — Bens e Direitos',
            sec1Code: 'Grupo 03 • Código 31 — Ações em Bolsa',
            sec1Hint: 'Declare cada ação com o CNPJ da empresa. O valor declarado é sempre o CUSTO DE AQUISIÇÃO, nunca o valor de mercado.',
            sec1PrevYear: 'Situação em 31/12 do ano anterior',
            sec1CurrYear: 'Situação em 31/12 do ano declarado',
            sec1AvgCost: 'Preço Médio',
            sec1TotalCost: 'Custo Total (declarar)',
            sec1Qty: 'Quantidade',
            sec1Empty: 'Nenhuma ação em carteira em 31/12.',
            sec2Title: 'Seção 2 — Dividendos',
            sec2Code: 'Ficha: Rendimentos Isentos e Não Tributáveis • Código 09',
            sec2Hint: 'Dividendos são isentos para Pessoa Física em 2025. Informe o CNPJ e o nome da empresa pagadora.',
            sec2Empty: 'Nenhum dividendo recebido no ano.',
            sec3Title: 'Seção 3 — JCP (Juros sobre Capital Próprio)',
            sec3Code: 'Ficha: Rendimentos Sujeitos à Tributação Exclusiva/Definitiva • Código 10',
            sec3Hint: 'O IR de 17,5% já foi retido na fonte pela empresa. Declare o VALOR BRUTO e o IRRF retido.',
            sec3GrossValue: 'Valor Bruto',
            sec3IrrfRetained: 'IRRF Retido (17,5%)',
            sec3NetReceived: 'Líquido Recebido',
            sec3Empty: 'Nenhum JCP recebido no ano.',
            sec4Title: 'Seção 4 — Renda Variável (Operações Comuns)',
            sec4Hint: 'Vendas ≤ R$ 20.000/mês: ISENTAS. Vendas > R$ 20.000/mês: 15% sobre o lucro. Pague via DARF até o último dia útil do mês seguinte.',
            sec4Month: 'Mês',
            sec4GrossSales: 'Total de Vendas',
            sec4CostBasis: 'Custo das Ações Vendidas',
            sec4Result: 'Resultado',
            sec4Status: 'Status',
            sec4LossOffset: 'Compensação de Perda',
            sec4TaxableResult: 'Base Tributável',
            sec4TaxDue: 'IR (15%)',
            sec4DarfDue: 'DARF — Pagar até',
            sec4Empty: 'Nenhuma venda registrada neste ano.',
            exempt: 'ISENTO',
            taxable: 'TRIBUTÁVEL',
            loss: 'PREJUÍZO',
            lossCarryNote: 'Prejuízos de meses isentos não são compensáveis (interpretação conservadora).',
            exemptNote: 'Vendas ≤ R$ 20.000 no mês — lucro isento, declarar apenas como isento no GCAP.',
            darfNote: 'Pagar DARF até o último dia útil do mês indicado.',
            printBtn: 'Imprimir',
            amortSection: 'Seção 5 — Amortização',
            amortHint: 'Amortização é devolução de capital. Não é tributada, mas reduz o custo médio da ação para fins de cálculo de ganho de capital futuro.',
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
            budgets: 'Budgets',
            budgetUsed: '$1 of $2 used',
            remaining: 'Remaining',
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
                description: 'Export and import your data as JSON (categories and transactions, including recurrence).',
                export: 'Export JSON',
                import: 'Import JSON',
            },
            autoBackup: {
                title: 'Automatic Backup',
                daily: 'Automatic backup',
                dailyDescription: 'Creates backup automatically at selected interval',
                enabled: 'Enabled',
                disabled: 'Disabled',
                maxBackups: 'backups kept (older ones are removed)',
                interval: 'Backup Interval',
                intervalDescription: 'How often automatic backup will be created',
                hourly: '1 hour',
                every4Hours: '4 hours',
                daily24h: '24 hours',
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
            budget: 'Monthly Budget (optional)',
            confirmDelete: 'Are you sure you want to delete this category?',
        },
        csvImport: {
            title: 'Import CSV',
            description: 'Import transactions from a bank statement CSV. AI will automatically categorize each transaction.',
            dragDrop: 'Drag and drop your CSV file here',
            selectFile: 'or click to select',
            processing: 'Processing...',
            aiCategorizing: 'AI is categorizing your transactions, this may take a few seconds.',
            results: 'Results',
            saveAll: 'Save All',
            saving: 'Saving...',
            saved: 'Transactions imported successfully!',
            importAnother: 'Import another',
            invalidFile: 'Invalid file. Use a .csv or .txt file',
            errorProcessing: 'Error processing the CSV file. Check the format.',
            errorSaving: 'Error saving transactions.',
            editCategory: 'Edit category',
            date: 'Date',
            descriptionCol: 'Description',
            amount: 'Amount',
            categoryCol: 'Category',
        },
        stocks: {
            title: 'Stock Portfolio',
            newStock: 'New Stock',
            editStock: 'Edit Stock',
            ticker: 'Ticker',
            tickerPlaceholder: 'E.g.: PETR4, VALE3, ITUB4',
            name: 'Company Name',
            sector: 'Sector',
            cnpj: 'CNPJ',
            cnpjPlaceholder: '00.000.000/0000-00',
            notes: 'Notes',
            noStocks: 'No stocks registered',
            noStocksHint: 'Click "New Stock" to get started',
            confirmDeleteStock: 'Delete stock and all its events?',
            quantity: 'Quantity',
            avgCost: 'Average Cost',
            totalInvested: 'Total Invested',
            totalSales: 'Total Sales',
            realizedPL: 'Realized P&L',
            totalDividends: 'Dividends',
            totalJcp: 'JCP',
            totalAmortization: 'Amortization',
            amortPerShare: 'Amortized Value per Share (R$)',
            reverseSplitRatio: 'Reverse Split Ratio',
            reverseSplitRatioHint: 'E.g.: 10 = every 10 shares become 1; 4 = every 4 become 1',
            portfolioSummary: 'Portfolio Summary',
            totalInvestedAll: 'Total Invested',
            totalReturnAll: 'Total Return',
            totalProventosAll: 'Income (Div + JCP)',
            events: 'Event History',
            addEvent: 'Add Event',
            editEvent: 'Edit Event',
            noEvents: 'No events registered',
            noEventsHint: 'Add purchases, sales, dividends and other events',
            confirmDeleteEvent: 'Delete this event?',
            eventType: 'Event Type',
            eventDate: 'Date',
            unitPrice: 'Price per Share (R$)',
            fees: 'Brokerage / Fees (R$)',
            splitRatio: 'Split Ratio',
            splitRatioHint: 'E.g.: 2 = 1 share becomes 2; 3 = 1 share becomes 3',
            totalValue: 'Total Amount Received (R$)',
            bonusShares: 'Bonus Shares Received',
            declaredValue: 'Declared Value per Share (R$)',
            eventTypes: {
                BUY: 'Purchase',
                SELL: 'Sale',
                DIVIDEND: 'Dividend',
                JCP: 'JCP',
                SPLIT: 'Stock Split',
                REVERSE_SPLIT: 'Reverse Split',
                BONUS: 'Bonus Shares',
                SUBSCRIPTION: 'Subscription',
                AMORTIZATION: 'Amortization',
            },
            shares: 'shares',
            back: 'Back to portfolio',
            detail: 'Details',
            jcpNote: 'Gross amount (17.5% IRRF withholding tax at source)',
            jcpValueType: 'The entered value is',
            jcpGrossLabel: 'Gross (before IRRF)',
            jcpNetLabel: 'Net (IRRF already deducted)',
            jcpGrossHint: 'The system calculates 17.5% IRRF on this value.',
            jcpNetHint: 'The system converts to gross automatically (÷ 0.825) for IRRF calculation.',
            amortNote: 'Reduces average cost; return of capital is tax-free (until avg cost = 0)',
            taxReport: 'Tax Report',
            backToPortfolio: 'Back to portfolio',
            eventsTab: 'Event History',
            proventosTab: 'Income by Month',
            filterAll: 'All',
            noProventos: 'No income recorded',
            proventosMonth: 'Month',
            proventosDividends: 'Dividends',
            proventosJcpGross: 'JCP Gross',
            proventosJcpIrrf: 'IRRF (17.5%)',
            proventosJcpNet: 'JCP Net',
            proventosAmort: 'Amortization',
            proventosTotal: 'Total Received',
            manageSectors: 'Manage Sectors',
            newSector: 'New Sector',
            editSector: 'Edit Sector',
            sectorName: 'Sector Name',
            sectorColor: 'Color',
            confirmDeleteSector: 'Delete this sector? Stocks using it will keep the name.',
            noSectors: 'No sectors registered',
            sectorSelect: 'Select sector',
            sectorCustom: 'Type manually',
            chartsTitle: 'Portfolio Charts',
            chartSectorAlloc: 'Allocation by Sector (%)',
            chartQtyByTicker: 'Shares by Ticker',
        },
        taxReport: {
            title: 'Income Tax Report',
            subtitle: 'Annual summary for IRPF declaration',
            year: 'Calendar year',
            summary: 'Year Summary',
            totalTaxDue: 'Tax Due (Variable Income)',
            lossCarriedForward: 'Loss to Carry Forward (future years)',
            totalDividendsIsentos: 'Tax-Free Dividends',
            totalJcpGross: 'Gross JCP Received',
            totalJcpIrrf: 'IRRF Withheld on JCP (15%)',
            totalAmortization: 'Amortization Received',
            noTaxDue: 'No variable income tax due this year.',
            sec1Title: 'Section 1 — Assets and Rights',
            sec1Code: 'Group 03 • Code 31 — Stocks',
            sec1Hint: 'Declare each stock with the company CNPJ. Always use ACQUISITION COST, never market value.',
            sec1PrevYear: 'Position at 31/12 prior year',
            sec1CurrYear: 'Position at 31/12 declared year',
            sec1AvgCost: 'Average Cost',
            sec1TotalCost: 'Total Cost (to declare)',
            sec1Qty: 'Quantity',
            sec1Empty: 'No stocks held on 31/12.',
            sec2Title: 'Section 2 — Dividends',
            sec2Code: 'Form: Tax-Free Income • Code 09',
            sec2Hint: 'Dividends are tax-free for individuals in 2025. Include company CNPJ and name.',
            sec2Empty: 'No dividends received this year.',
            sec3Title: 'Section 3 — JCP (Interest on Net Equity)',
            sec3Code: 'Form: Exclusive/Definitive Taxation • Code 10',
            sec3Hint: 'The 17.5% tax was already withheld at source. Declare the GROSS AMOUNT and IRRF withheld.',
            sec3GrossValue: 'Gross Amount',
            sec3IrrfRetained: 'IRRF Withheld (17.5%)',
            sec3NetReceived: 'Net Received',
            sec3Empty: 'No JCP received this year.',
            sec4Title: 'Section 4 — Variable Income (Common Operations)',
            sec4Hint: 'Sales ≤ R$ 20,000/month: EXEMPT. Sales > R$ 20,000/month: 15% on gains. Pay via DARF by last business day of following month.',
            sec4Month: 'Month',
            sec4GrossSales: 'Total Sales',
            sec4CostBasis: 'Cost of Shares Sold',
            sec4Result: 'Result',
            sec4Status: 'Status',
            sec4LossOffset: 'Loss Offset',
            sec4TaxableResult: 'Taxable Result',
            sec4TaxDue: 'Tax (15%)',
            sec4DarfDue: 'DARF — Pay by',
            sec4Empty: 'No sales recorded this year.',
            exempt: 'EXEMPT',
            taxable: 'TAXABLE',
            loss: 'LOSS',
            lossCarryNote: 'Losses from exempt months cannot be offset (conservative interpretation).',
            exemptNote: 'Sales ≤ R$ 20,000 — gains exempt, declare as exempt in GCAP.',
            darfNote: 'Pay DARF by last business day of indicated month.',
            printBtn: 'Print',
            amortSection: 'Section 5 — Amortization',
            amortHint: 'Amortization is return of capital. Not taxed, but reduces average cost for future capital gains calculation.',
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
