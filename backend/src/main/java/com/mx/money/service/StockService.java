package com.mx.money.service;

import com.mx.money.dto.*;
import com.mx.money.entity.Stock;
import com.mx.money.entity.StockEvent;
import com.mx.money.repository.StockEventRepository;
import com.mx.money.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;
    private final StockEventRepository stockEventRepository;

    // ---- Stocks CRUD ----

    public List<StockResponse> findAll() {
        return stockRepository.findAll().stream()
                .map(this::toStockResponse)
                .toList();
    }

    public StockResponse findById(Long id) {
        return toStockResponse(getStock(id));
    }

    @Transactional
    public StockResponse create(StockRequest request) {
        String ticker = request.getTicker().toUpperCase().trim();
        if (stockRepository.findByTickerIgnoreCase(ticker).isPresent()) {
            throw new IllegalArgumentException("Ticker '" + ticker + "' já cadastrado");
        }
        Stock stock = Stock.builder()
                .ticker(ticker)
                .name(request.getName())
                .sector(request.getSector())
                .cnpj(request.getCnpj())
                .notes(request.getNotes())
                .build();
        return toStockResponse(stockRepository.save(stock));
    }

    @Transactional
    public StockResponse update(Long id, StockRequest request) {
        Stock stock = getStock(id);
        String ticker = request.getTicker().toUpperCase().trim();
        if (stockRepository.existsByTickerIgnoreCaseAndIdNot(ticker, id)) {
            throw new IllegalArgumentException("Ticker '" + ticker + "' já cadastrado em outra ação");
        }
        stock.setTicker(ticker);
        stock.setName(request.getName());
        stock.setSector(request.getSector());
        stock.setCnpj(request.getCnpj());
        stock.setNotes(request.getNotes());
        return toStockResponse(stockRepository.save(stock));
    }

    /**
     * Remove a ação e TODOS os seus eventos (compras, vendas, dividendos, JCP,
     * desdobramentos, grupamentos, subscrições, amortizações e bonificações).
     */
    @Transactional
    public void delete(Long id) {
        getStock(id);
        stockEventRepository.deleteAllByStockId(id);
        stockRepository.deleteById(id);
    }

    // ---- Events CRUD ----

    public List<StockEventResponse> findEvents(Long stockId) {
        getStock(stockId);
        return stockEventRepository.findByStockIdOrderByEventDateAscIdAsc(stockId).stream()
                .map(this::toEventResponse)
                .toList();
    }

    private static final BigDecimal JCP_GROSS_FACTOR = new BigDecimal("0.825"); // 1 - 0.175

    @Transactional
    public StockEventResponse addEvent(Long stockId, StockEventRequest request) {
        Stock stock = getStock(stockId);
        StockEvent event = StockEvent.builder()
                .stock(stock)
                .type(request.getType())
                .eventDate(request.getEventDate())
                .quantity(request.getQuantity())
                .unitPrice(request.getUnitPrice())
                .fees(request.getFees())
                .splitRatio(request.getSplitRatio())
                .totalValue(normalizeJcpValue(request))
                .notes(request.getNotes())
                .build();
        return toEventResponse(stockEventRepository.save(event));
    }

    @Transactional
    public StockEventResponse updateEvent(Long stockId, Long eventId, StockEventRequest request) {
        StockEvent event = getEvent(stockId, eventId);
        event.setType(request.getType());
        event.setEventDate(request.getEventDate());
        event.setQuantity(request.getQuantity());
        event.setUnitPrice(request.getUnitPrice());
        event.setFees(request.getFees());
        event.setSplitRatio(request.getSplitRatio());
        event.setTotalValue(normalizeJcpValue(request));
        event.setNotes(request.getNotes());
        return toEventResponse(stockEventRepository.save(event));
    }

    /** Se o evento JCP vier marcado como líquido, converte para bruto: bruto = líquido ÷ 0.825 */
    private BigDecimal normalizeJcpValue(StockEventRequest request) {
        BigDecimal tv = request.getTotalValue();
        if (tv == null) return null;
        if (request.getType() == com.mx.money.entity.StockEventType.JCP
                && Boolean.TRUE.equals(request.getJcpValueIsNet())) {
            return tv.divide(JCP_GROSS_FACTOR, 10, RoundingMode.HALF_UP);
        }
        return tv;
    }

    @Transactional
    public void deleteEvent(Long stockId, Long eventId) {
        StockEvent event = getEvent(stockId, eventId);
        stockEventRepository.delete(event);
    }

    // ---- Portfolio calculation ----

    public List<StockPositionResponse> getAllPositions() {
        return stockRepository.findAll().stream()
                .map(stock -> calculatePosition(stock,
                        stockEventRepository.findByStockIdOrderByEventDateAscIdAsc(stock.getId())))
                .toList();
    }

    public StockPositionResponse getPosition(Long stockId) {
        Stock stock = getStock(stockId);
        return calculatePosition(stock,
                stockEventRepository.findByStockIdOrderByEventDateAscIdAsc(stockId));
    }

    /**
     * Calcula a posição de uma ação processando todos os eventos em ordem cronológica.
     *
     * Regras fiscais brasileiras aplicadas:
     * - BUY / SUBSCRIPTION: custo médio ponderado (método da Receita Federal)
     * - SELL: resultado = (preço_venda - PM) × qtd - taxas; PM inalterado
     * - DIVIDEND: isento de IR para Pessoa Física
     * - JCP: 15% IRRF retido na fonte; valor armazenado é o bruto
     * - SPLIT: multiplica quantidade, divide PM proporcionalmente
     * - REVERSE_SPLIT: divide quantidade, multiplica PM proporcionalmente
     * - BONUS: novas ações ao valor patrimonial declarado recalculam o PM
     * - AMORTIZATION: reduz PM pelo valor por ação devolvido (sem imposto até PM=0)
     */
    private StockPositionResponse calculatePosition(Stock stock, List<StockEvent> events) {
        BigDecimal quantity       = BigDecimal.ZERO;
        BigDecimal avgCost        = BigDecimal.ZERO;
        BigDecimal totalInvested  = BigDecimal.ZERO;
        BigDecimal totalSales     = BigDecimal.ZERO;
        BigDecimal realizedPL     = BigDecimal.ZERO;
        BigDecimal totalDividends = BigDecimal.ZERO;
        BigDecimal totalJcp       = BigDecimal.ZERO;
        BigDecimal totalAmort     = BigDecimal.ZERO;

        for (StockEvent e : events) {
            BigDecimal qty   = nvl(e.getQuantity());
            BigDecimal price = nvl(e.getUnitPrice());
            BigDecimal fees  = nvl(e.getFees());

            switch (e.getType()) {
                // ---- Compra e Subscrição: tratamento idêntico para custo médio ----
                case BUY, SUBSCRIPTION -> {
                    BigDecimal buyCost = qty.multiply(price).add(fees);
                    BigDecimal newQty  = quantity.add(qty);
                    if (newQty.compareTo(BigDecimal.ZERO) > 0) {
                        avgCost = quantity.multiply(avgCost).add(buyCost)
                                .divide(newQty, 10, RoundingMode.HALF_UP);
                    }
                    quantity      = newQty;
                    totalInvested = totalInvested.add(buyCost);
                }

                // ---- Venda ----
                case SELL -> {
                    BigDecimal netProceeds = qty.multiply(price).subtract(fees);
                    BigDecimal costBasis   = qty.multiply(avgCost);
                    realizedPL = realizedPL.add(netProceeds.subtract(costBasis));
                    totalSales = totalSales.add(netProceeds);
                    quantity   = quantity.subtract(qty);
                    if (quantity.compareTo(BigDecimal.ZERO) <= 0) {
                        quantity = BigDecimal.ZERO;
                        avgCost  = BigDecimal.ZERO;
                    }
                }

                // ---- Proventos em dinheiro ----
                case DIVIDEND -> totalDividends = totalDividends.add(nvl(e.getTotalValue()));
                case JCP      -> totalJcp       = totalJcp.add(nvl(e.getTotalValue()));

                // ---- Desdobramento: multiplica qtd, divide PM ----
                case SPLIT -> {
                    BigDecimal ratio = nvl(e.getSplitRatio());
                    if (ratio.compareTo(BigDecimal.ZERO) > 0 && quantity.compareTo(BigDecimal.ZERO) > 0) {
                        quantity = quantity.multiply(ratio).setScale(4, RoundingMode.HALF_UP);
                        avgCost  = avgCost.divide(ratio, 10, RoundingMode.HALF_UP);
                    }
                }

                // ---- Grupamento: divide qtd, multiplica PM ----
                case REVERSE_SPLIT -> {
                    BigDecimal ratio = nvl(e.getSplitRatio());
                    if (ratio.compareTo(BigDecimal.ZERO) > 0 && quantity.compareTo(BigDecimal.ZERO) > 0) {
                        quantity = quantity.divide(ratio, 4, RoundingMode.HALF_UP);
                        avgCost  = avgCost.multiply(ratio);
                    }
                }

                // ---- Bonificação: novas ações ao valor patrimonial recalculam PM ----
                case BONUS -> {
                    if (qty.compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal bonusCost = qty.multiply(price);
                        BigDecimal newQty    = quantity.add(qty);
                        if (newQty.compareTo(BigDecimal.ZERO) > 0) {
                            avgCost = quantity.multiply(avgCost).add(bonusCost)
                                    .divide(newQty, 10, RoundingMode.HALF_UP);
                        }
                        quantity      = newQty;
                        totalInvested = totalInvested.add(bonusCost);
                    }
                }

                // ---- Amortização: devolução de capital reduz PM (sem imposto até PM=0) ----
                case AMORTIZATION -> {
                    BigDecimal perShare = price; // unitPrice = valor amortizado por ação
                    if (perShare.compareTo(BigDecimal.ZERO) > 0) {
                        avgCost = avgCost.subtract(perShare).max(BigDecimal.ZERO);
                    }
                    totalAmort = totalAmort.add(nvl(e.getTotalValue()));
                }
            }
        }

        return StockPositionResponse.builder()
                .stockId(stock.getId())
                .ticker(stock.getTicker())
                .name(stock.getName())
                .sector(stock.getSector())
                .quantity(quantity.setScale(4, RoundingMode.HALF_UP))
                .averageCost(avgCost.setScale(6, RoundingMode.HALF_UP))
                .totalInvested(totalInvested.setScale(2, RoundingMode.HALF_UP))
                .totalSales(totalSales.setScale(2, RoundingMode.HALF_UP))
                .realizedPL(realizedPL.setScale(2, RoundingMode.HALF_UP))
                .totalDividends(totalDividends.setScale(2, RoundingMode.HALF_UP))
                .totalJcp(totalJcp.setScale(2, RoundingMode.HALF_UP))
                .totalAmortization(totalAmort.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    // ---- Tax Report ----

    /**
     * Gera o relatório anual para declaração do Imposto de Renda.
     *
     * Regras aplicadas (vigentes em 2025):
     * - Isenção de R$ 20.000/mês em vendas de ações em operações comuns (swing trade)
     * - Alíquota de 15% sobre o lucro tributável
     * - Compensação de prejuízo: somente prejuízos de meses tributáveis (vendas > R$ 20k)
     *   podem ser compensados em meses futuros (interpretação conservadora da Receita Federal)
     * - Dividendos: isentos para PF (código 09 — Rendimentos Isentos)
     * - JCP: 15% IRRF retido na fonte (código 10 — Tributação Exclusiva/Definitiva)
     * - Bens e Direitos: código 31, valor = custo de aquisição (não valor de mercado)
     * - DARF: último dia útil do mês seguinte ao mês de apuração
     */
    public StockTaxReportResponse generateTaxReport(int year) {
        LocalDate prevYearEnd = LocalDate.of(year - 1, 12, 31);
        LocalDate yearStart   = LocalDate.of(year, 1, 1);
        LocalDate yearEnd     = LocalDate.of(year, 12, 31);

        // Coleta de vendas do ano com custo no momento da venda
        record SaleData(LocalDate date, BigDecimal grossSales, BigDecimal costBasis) {}
        List<SaleData> allSales = new ArrayList<>();

        List<YearEndPositionDto> yearEndPositions = new ArrayList<>();
        // ticker → proventos acumulados no ano
        Map<String, ProventosDto> proventosMap = new LinkedHashMap<>();

        for (Stock stock : stockRepository.findAll()) {
            List<StockEvent> events =
                    stockEventRepository.findByStockIdOrderByEventDateAscIdAsc(stock.getId());

            // Estado da posição (atualizado incrementalmente)
            BigDecimal qty     = BigDecimal.ZERO;
            BigDecimal avgCost = BigDecimal.ZERO;

            // Acumuladores do ano corrente
            BigDecimal yearDividends = BigDecimal.ZERO;
            BigDecimal yearJcpGross  = BigDecimal.ZERO;
            BigDecimal yearAmort     = BigDecimal.ZERO;

            // Estado ao fim do ano anterior (para "Situação anterior" no IRPF)
            BigDecimal prevQty      = BigDecimal.ZERO;
            BigDecimal prevAvgCost  = BigDecimal.ZERO;
            boolean prevRecorded    = false;

            for (StockEvent e : events) {
                // Captura snapshot ao fim do ano anterior
                if (!prevRecorded && e.getEventDate().isAfter(prevYearEnd)) {
                    prevQty    = qty;
                    prevAvgCost = avgCost;
                    prevRecorded = true;
                }

                BigDecimal q   = nvl(e.getQuantity());
                BigDecimal p   = nvl(e.getUnitPrice());
                BigDecimal fee = nvl(e.getFees());

                // inYear: evento dentro do ano declarado → conta para proventos e vendas
                boolean inYear = !e.getEventDate().isBefore(yearStart)
                              && !e.getEventDate().isAfter(yearEnd);

                // affectsPosition: evento até 31/12 do ano declarado → atualiza qtd/PM
                // Eventos APÓS yearEnd NÃO devem modificar a posição reportada no relatório
                boolean affectsPosition = !e.getEventDate().isAfter(yearEnd);

                switch (e.getType()) {
                    case BUY, SUBSCRIPTION -> {
                        if (!affectsPosition) break;
                        BigDecimal cost   = q.multiply(p).add(fee);
                        BigDecimal newQty = qty.add(q);
                        if (newQty.compareTo(BigDecimal.ZERO) > 0) {
                            avgCost = qty.multiply(avgCost).add(cost)
                                    .divide(newQty, 10, RoundingMode.HALF_UP);
                        }
                        qty = newQty;
                    }
                    case SELL -> {
                        if (inYear) {
                            BigDecimal grossSales = q.multiply(p).subtract(fee);
                            BigDecimal costBasis  = q.multiply(avgCost);
                            allSales.add(new SaleData(e.getEventDate(), grossSales, costBasis));
                        }
                        // Atualiza posição apenas para vendas até o fim do ano declarado
                        if (affectsPosition) {
                            qty = qty.subtract(q);
                            if (qty.compareTo(BigDecimal.ZERO) <= 0) {
                                qty = BigDecimal.ZERO;
                                avgCost = BigDecimal.ZERO;
                            }
                        }
                    }
                    case DIVIDEND -> { if (inYear) yearDividends = yearDividends.add(nvl(e.getTotalValue())); }
                    case JCP      -> { if (inYear) yearJcpGross  = yearJcpGross.add(nvl(e.getTotalValue())); }
                    case SPLIT -> {
                        if (!affectsPosition) break;
                        BigDecimal r = nvl(e.getSplitRatio());
                        if (r.compareTo(BigDecimal.ZERO) > 0 && qty.compareTo(BigDecimal.ZERO) > 0) {
                            qty     = qty.multiply(r).setScale(4, RoundingMode.HALF_UP);
                            avgCost = avgCost.divide(r, 10, RoundingMode.HALF_UP);
                        }
                    }
                    case REVERSE_SPLIT -> {
                        if (!affectsPosition) break;
                        BigDecimal r = nvl(e.getSplitRatio());
                        if (r.compareTo(BigDecimal.ZERO) > 0 && qty.compareTo(BigDecimal.ZERO) > 0) {
                            qty     = qty.divide(r, 4, RoundingMode.HALF_UP);
                            avgCost = avgCost.multiply(r);
                        }
                    }
                    case BONUS -> {
                        if (!affectsPosition) break;
                        if (q.compareTo(BigDecimal.ZERO) > 0) {
                            BigDecimal bonusCost = q.multiply(p);
                            BigDecimal newQty    = qty.add(q);
                            if (newQty.compareTo(BigDecimal.ZERO) > 0) {
                                avgCost = qty.multiply(avgCost).add(bonusCost)
                                        .divide(newQty, 10, RoundingMode.HALF_UP);
                            }
                            qty = newQty;
                        }
                    }
                    case AMORTIZATION -> {
                        if (affectsPosition && p.compareTo(BigDecimal.ZERO) > 0) {
                            avgCost = avgCost.subtract(p).max(BigDecimal.ZERO);
                        }
                        if (inYear) yearAmort = yearAmort.add(nvl(e.getTotalValue()));
                    }
                }
            }

            // Snapshot do ano anterior se nenhum evento vier após prevYearEnd
            if (!prevRecorded) {
                prevQty    = qty;
                prevAvgCost = avgCost;
            }

            // Posição ao fim do ano declarado — inclui ações zeradas no ano (prevQty > 0 e qty = 0)
            if (qty.compareTo(BigDecimal.ZERO) > 0 || prevQty.compareTo(BigDecimal.ZERO) > 0) {
                yearEndPositions.add(YearEndPositionDto.builder()
                        .ticker(stock.getTicker())
                        .name(stock.getName())
                        .cnpj(stock.getCnpj())
                        .quantity(qty.setScale(4, RoundingMode.HALF_UP))
                        .averageCost(avgCost.setScale(6, RoundingMode.HALF_UP))
                        .totalCost(qty.multiply(avgCost).setScale(2, RoundingMode.HALF_UP))
                        .prevQuantity(prevQty.setScale(4, RoundingMode.HALF_UP))
                        .prevTotalCost(prevQty.multiply(prevAvgCost).setScale(2, RoundingMode.HALF_UP))
                        .build());
            }

            // Proventos do ano
            if (yearDividends.compareTo(BigDecimal.ZERO) > 0
                    || yearJcpGross.compareTo(BigDecimal.ZERO) > 0
                    || yearAmort.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal irrf = yearJcpGross.multiply(new BigDecimal("0.175"))
                                             .setScale(2, RoundingMode.HALF_UP);
                proventosMap.put(stock.getTicker(), ProventosDto.builder()
                        .ticker(stock.getTicker())
                        .name(stock.getName())
                        .cnpj(stock.getCnpj())
                        .dividends(yearDividends.setScale(2, RoundingMode.HALF_UP))
                        .jcpGross(yearJcpGross.setScale(2, RoundingMode.HALF_UP))
                        .jcpIrrf(irrf)
                        .jcpNet(yearJcpGross.subtract(irrf).setScale(2, RoundingMode.HALF_UP))
                        .amortization(yearAmort.setScale(2, RoundingMode.HALF_UP))
                        .build());
            }
        }

        // Agrega vendas por mês e calcula tributação
        BigDecimal EXEMPTION  = new BigDecimal("20000.00");
        BigDecimal RATE       = new BigDecimal("0.15");

        Map<YearMonth, BigDecimal> monthlySales = new LinkedHashMap<>();
        Map<YearMonth, BigDecimal> monthlyCosts = new LinkedHashMap<>();

        for (SaleData s : allSales) {
            YearMonth ym = YearMonth.from(s.date());
            monthlySales.merge(ym, s.grossSales(), BigDecimal::add);
            monthlyCosts.merge(ym, s.costBasis(), BigDecimal::add);
        }

        BigDecimal lossCarryForward = BigDecimal.ZERO;
        List<MonthlyTaxDto> monthlyResults = new ArrayList<>();
        BigDecimal totalTaxDue = BigDecimal.ZERO;

        for (int m = 1; m <= 12; m++) {
            YearMonth ym       = YearMonth.of(year, m);
            BigDecimal sales   = monthlySales.getOrDefault(ym, BigDecimal.ZERO);
            BigDecimal costs   = monthlyCosts.getOrDefault(ym, BigDecimal.ZERO);
            if (sales.compareTo(BigDecimal.ZERO) == 0) continue;

            BigDecimal grossResult     = sales.subtract(costs);
            boolean exempt             = sales.compareTo(EXEMPTION) <= 0;
            BigDecimal lossOffset      = BigDecimal.ZERO;
            BigDecimal taxableResult   = BigDecimal.ZERO;
            BigDecimal taxDue          = BigDecimal.ZERO;
            BigDecimal newLoss         = BigDecimal.ZERO;

            if (!exempt) {
                if (grossResult.compareTo(BigDecimal.ZERO) > 0) {
                    // Lucro: compensar com prejuízo acumulado
                    lossOffset      = lossCarryForward.min(grossResult);
                    lossCarryForward = lossCarryForward.subtract(lossOffset);
                    taxableResult   = grossResult.subtract(lossOffset);
                    taxDue          = taxableResult.multiply(RATE).setScale(2, RoundingMode.HALF_UP);
                } else {
                    // Prejuízo tributável: carrega para frente
                    newLoss          = grossResult.negate();
                    lossCarryForward = lossCarryForward.add(newLoss);
                }
            }
            // Nota: prejuízo em mês isento NÃO é carregado (interpretação conservadora)

            totalTaxDue = totalTaxDue.add(taxDue);

            String darfMonth = YearMonth.of(year, m == 12 ? 1 : m + 1)
                    .getMonth()
                    .getDisplayName(TextStyle.FULL, new Locale("pt", "BR"));
            if (m == 12) darfMonth = "Janeiro de " + (year + 1);

            monthlyResults.add(MonthlyTaxDto.builder()
                    .month(m)
                    .monthLabel(ym.getMonth().getDisplayName(TextStyle.FULL, new Locale("pt", "BR")))
                    .grossSales(sales.setScale(2, RoundingMode.HALF_UP))
                    .totalCostBasis(costs.setScale(2, RoundingMode.HALF_UP))
                    .grossResult(grossResult.setScale(2, RoundingMode.HALF_UP))
                    .exempt(exempt)
                    .lossOffset(lossOffset.setScale(2, RoundingMode.HALF_UP))
                    .taxableResult(taxableResult.setScale(2, RoundingMode.HALF_UP))
                    .taxDue(taxDue.setScale(2, RoundingMode.HALF_UP))
                    .newLossGenerated(newLoss.setScale(2, RoundingMode.HALF_UP))
                    .darfDueMonth(darfMonth)
                    .build());
        }

        // Totais de proventos
        BigDecimal totDiv  = proventosMap.values().stream().map(ProventosDto::getDividends)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totJcp  = proventosMap.values().stream().map(ProventosDto::getJcpGross)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totIrrf = proventosMap.values().stream().map(ProventosDto::getJcpIrrf)
                                        .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totAmort = proventosMap.values().stream().map(ProventosDto::getAmortization)
                                         .reduce(BigDecimal.ZERO, BigDecimal::add);

        return StockTaxReportResponse.builder()
                .year(year)
                .yearEndPositions(yearEndPositions)
                .proventos(new ArrayList<>(proventosMap.values()))
                .monthlyResults(monthlyResults)
                .totalTaxDue(totalTaxDue.setScale(2, RoundingMode.HALF_UP))
                .lossCarriedForward(lossCarryForward.setScale(2, RoundingMode.HALF_UP))
                .totalDividends(totDiv.setScale(2, RoundingMode.HALF_UP))
                .totalJcpGross(totJcp.setScale(2, RoundingMode.HALF_UP))
                .totalJcpIrrf(totIrrf.setScale(2, RoundingMode.HALF_UP))
                .totalAmortization(totAmort.setScale(2, RoundingMode.HALF_UP))
                .build();
    }

    // ---- Helpers ----

    private Stock getStock(Long id) {
        return stockRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Ação não encontrada: " + id));
    }

    private StockEvent getEvent(Long stockId, Long eventId) {
        StockEvent event = stockEventRepository.findById(eventId)
                .orElseThrow(() -> new NoSuchElementException("Evento não encontrado: " + eventId));
        if (!event.getStock().getId().equals(stockId)) {
            throw new NoSuchElementException("Evento não pertence a esta ação");
        }
        return event;
    }

    private BigDecimal nvl(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private StockResponse toStockResponse(Stock stock) {
        return StockResponse.builder()
                .id(stock.getId())
                .ticker(stock.getTicker())
                .name(stock.getName())
                .sector(stock.getSector())
                .cnpj(stock.getCnpj())
                .notes(stock.getNotes())
                .createdAt(stock.getCreatedAt())
                .build();
    }

    private StockEventResponse toEventResponse(StockEvent event) {
        return StockEventResponse.builder()
                .id(event.getId())
                .stockId(event.getStock().getId())
                .ticker(event.getStock().getTicker())
                .type(event.getType())
                .eventDate(event.getEventDate())
                .quantity(event.getQuantity())
                .unitPrice(event.getUnitPrice())
                .fees(event.getFees())
                .splitRatio(event.getSplitRatio())
                .totalValue(event.getTotalValue())
                .notes(event.getNotes())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
