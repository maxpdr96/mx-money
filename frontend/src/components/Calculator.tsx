import { useState } from 'react';

interface CalculatorProps {
    onUse: (value: string) => void;
}

type CalcOp = '+' | '-' | '×' | '÷' | null;

export function Calculator({ onUse }: CalculatorProps) {
    const [display, setDisplay] = useState('0');
    const [operator, setOperator] = useState<CalcOp>(null);
    const [operand, setOperand] = useState<number | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);
    const [applied, setApplied] = useState(false);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            const commaIdx = display.indexOf(',');
            if (commaIdx !== -1 && display.length - commaIdx > 2) return;
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDecimal = () => {
        if (waitingForOperand) {
            setDisplay('0,');
            setWaitingForOperand(false);
            return;
        }
        if (!display.includes(',')) {
            setDisplay(display + ',');
        }
    };

    const parseDisplay = () => parseFloat(display.replace(',', '.'));

    const fmt = (n: number): string => {
        if (!isFinite(n)) return '0,00';
        return n.toFixed(2).replace('.', ',');
    };

    const calculate = (a: number, b: number, op: CalcOp): number => {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '×': return a * b;
            case '÷': return b !== 0 ? a / b : 0;
            default: return b;
        }
    };

    const handleOperator = (op: CalcOp) => {
        const current = parseDisplay();
        if (operand !== null && !waitingForOperand) {
            const result = calculate(operand, current, operator);
            setDisplay(fmt(result));
            setOperand(result);
        } else {
            setOperand(current);
        }
        setOperator(op);
        setWaitingForOperand(true);
    };

    const handleEquals = () => {
        if (operator === null || operand === null) return;
        const current = parseDisplay();
        const result = calculate(operand, current, operator);
        setDisplay(fmt(result));
        setOperand(null);
        setOperator(null);
        setWaitingForOperand(true);
    };

    const handleClear = () => {
        setDisplay('0');
        setOperator(null);
        setOperand(null);
        setWaitingForOperand(false);
    };

    const handleToggleSign = () => {
        const val = parseDisplay();
        setDisplay(fmt(-val));
    };

    const handlePercent = () => {
        const val = parseDisplay();
        const result = operand !== null && operator ? (operand * val) / 100 : val / 100;
        setDisplay(fmt(result));
        setWaitingForOperand(true);
    };

    const currentValue = parseDisplay();
    const canUse = isFinite(currentValue) && currentValue !== 0;

    const handleUse = () => {
        if (!canUse) return;
        const formatted = fmt(Math.abs(currentValue));
        onUse(formatted);
        setApplied(true);
        setTimeout(() => {
            setApplied(false);
            handleClear();
        }, 1200);
    };

    const isActiveOp = (op: CalcOp) => operator === op && waitingForOperand;

    const useLabel = applied
        ? '✓ Aplicado!'
        : canUse
            ? `Usar ${fmt(Math.abs(currentValue))} →`
            : 'Usar valor →';

    return (
        <div className="calc-panel">
            <div className="calc-display">{display}</div>
            <div className="calc-grid">
                <button className="calc-btn calc-btn-fn" onClick={handleClear}>AC</button>
                <button className="calc-btn calc-btn-fn" onClick={handleToggleSign}>+/−</button>
                <button className="calc-btn calc-btn-fn" onClick={handlePercent}>%</button>
                <button className={`calc-btn calc-btn-op ${isActiveOp('÷') ? 'active' : ''}`} onClick={() => handleOperator('÷')}>÷</button>

                <button className="calc-btn" onClick={() => inputDigit('7')}>7</button>
                <button className="calc-btn" onClick={() => inputDigit('8')}>8</button>
                <button className="calc-btn" onClick={() => inputDigit('9')}>9</button>
                <button className={`calc-btn calc-btn-op ${isActiveOp('×') ? 'active' : ''}`} onClick={() => handleOperator('×')}>×</button>

                <button className="calc-btn" onClick={() => inputDigit('4')}>4</button>
                <button className="calc-btn" onClick={() => inputDigit('5')}>5</button>
                <button className="calc-btn" onClick={() => inputDigit('6')}>6</button>
                <button className={`calc-btn calc-btn-op ${isActiveOp('-') ? 'active' : ''}`} onClick={() => handleOperator('-')}>−</button>

                <button className="calc-btn" onClick={() => inputDigit('1')}>1</button>
                <button className="calc-btn" onClick={() => inputDigit('2')}>2</button>
                <button className="calc-btn" onClick={() => inputDigit('3')}>3</button>
                <button className={`calc-btn calc-btn-op ${isActiveOp('+') ? 'active' : ''}`} onClick={() => handleOperator('+')}>+</button>

                <button className="calc-btn calc-btn-wide" onClick={() => inputDigit('0')}>0</button>
                <button className="calc-btn" onClick={inputDecimal}>,</button>
                <button className="calc-btn calc-btn-op" onClick={handleEquals}>=</button>
            </div>
            <button
                className={`calc-use-btn${applied ? ' applied' : ''}${!canUse ? ' disabled' : ''}`}
                onClick={handleUse}
                disabled={!canUse || applied}
            >
                {useLabel}
            </button>
        </div>
    );
}
