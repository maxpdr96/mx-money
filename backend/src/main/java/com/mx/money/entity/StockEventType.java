package com.mx.money.entity;

public enum StockEventType {
    BUY,          // Compra de ações
    SELL,         // Venda de ações
    DIVIDEND,     // Dividendo (isento de IR para PF)
    JCP,          // Juros sobre Capital Próprio (15% IRRF retido na fonte)
    SPLIT,        // Desdobramento: 1 ação vira N (multiplica qtd, divide PM)
    REVERSE_SPLIT,// Grupamento: N ações viram 1 (divide qtd, multiplica PM)
    BONUS,        // Bonificação: empresa distribui novas ações ao valor patrimonial
    SUBSCRIPTION, // Subscrição: exercício de direito de compra de novas ações
    AMORTIZATION  // Amortização: devolução de capital (reduz custo médio, comum em FIIs)
}
