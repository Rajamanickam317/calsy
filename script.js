// Calculator State
let display = '0';
let previousValue = null;
let operation = null;
let waitingForOperand = false;
let history = [];

// API endpoint (change this to your Flask server URL)
const API_URL = 'http://localhost:5000/api';

// Update Display
function updateDisplay() {
    document.getElementById('mainDisplay').textContent = display;
    
    if (operation && previousValue !== null) {
        document.getElementById('operationDisplay').textContent = `${previousValue} ${operation}`;
    } else {
        document.getElementById('operationDisplay').textContent = '';
    }
}

// Input Digit
function inputDigit(digit) {
    if (waitingForOperand) {
        display = String(digit);
        waitingForOperand = false;
    } else {
        display = display === '0' ? String(digit) : display + digit;
    }
    updateDisplay();
}

// Input Decimal
function inputDecimal() {
    if (waitingForOperand) {
        display = '0.';
        waitingForOperand = false;
    } else if (display.indexOf('.') === -1) {
        display = display + '.';
    }
    updateDisplay();
}

// Input Pi
function inputPi() {
    display = String(Math.PI);
    waitingForOperand = true;
    updateDisplay();
}

// Clear All
function clearAll() {
    display = '0';
    previousValue = null;
    operation = null;
    waitingForOperand = false;
    updateDisplay();
}

// Backspace
function backspace() {
    if (!waitingForOperand && display.length > 1) {
        display = display.slice(0, -1);
    } else {
        display = '0';
    }
    updateDisplay();
}

// Toggle Sign
function toggleSign() {
    display = String(parseFloat(display) * -1);
    updateDisplay();
}

// Perform Operation (with backend API)
async function performOperation(nextOperation) {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
        previousValue = inputValue;
    } else if (operation) {
        try {
            // Call backend API for calculation
            const response = await fetch(`${API_URL}/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    num1: previousValue,
                    num2: inputValue,
                    operation: operation
                })
            });

            const data = await response.json();

            if (data.error) {
                display = 'Error';
                previousValue = null;
                operation = null;
            } else {
                const calculation = `${previousValue} ${operation} ${inputValue} = ${data.result}`;
                addToHistory(calculation);
                display = String(data.result);
                previousValue = data.result;
            }
        } catch (error) {
            console.error('API Error:', error);
            // Fallback to local calculation if API fails
            const result = calculateLocally(previousValue, inputValue, operation);
            if (result !== null) {
                const calculation = `${previousValue} ${operation} ${inputValue} = ${result}`;
                addToHistory(calculation);
                display = String(result);
                previousValue = result;
            } else {
                display = 'Error';
                previousValue = null;
                operation = null;
            }
        }
    }

    waitingForOperand = true;
    operation = nextOperation;
    updateDisplay();
}

// Local Calculation (Fallback)
function calculateLocally(num1, num2, op) {
    switch (op) {
        case '+':
            return num1 + num2;
        case '-':
            return num1 - num2;
        case '×':
            return num1 * num2;
        case '÷':
            return num2 !== 0 ? num1 / num2 : null;
        case '%':
            return num1 % num2;
        default:
            return num2;
    }
}

// Perform Special Operations
function performSpecialOperation(op) {
    const inputValue = parseFloat(display);
    let result;

    switch (op) {
        case 'sqrt':
            result = inputValue >= 0 ? Math.sqrt(inputValue) : null;
            break;
        case 'square':
            result = inputValue * inputValue;
            break;
        case 'reciprocal':
            result = inputValue !== 0 ? 1 / inputValue : null;
            break;
        default:
            return;
    }

    if (result !== null) {
        display = String(result);
        previousValue = null;
        operation = null;
        waitingForOperand = true;
        updateDisplay();
    } else {
        display = 'Error';
        updateDisplay();
    }
}

// Add to History
function addToHistory(calculation) {
    history.unshift(calculation);
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    updateHistory();
}

// Update History Display
function updateHistory() {
    const historyContent = document.getElementById('historyContent');
    
    if (history.length === 0) {
        historyContent.innerHTML = '<div class="no-history">No calculations yet</div>';
    } else {
        historyContent.innerHTML = history.map(calc => 
            `<div class="history-item">${calc}</div>`
        ).join('');
    }
}

// Clear History
function clearHistory() {
    history = [];
    updateHistory();
}

// Keyboard Support
document.addEventListener('keydown', function(event) {
    const key = event.key;
    
    if (key >= '0' && key <= '9') {
        inputDigit(key);
    } else if (key === '.') {
        inputDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        const op = key === '*' ? '×' : key === '/' ? '÷' : key;
        performOperation(op);
    } else if (key === 'Enter' || key === '=') {
        performOperation('=');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
        clearAll();
    } else if (key === 'Backspace') {
        backspace();
    }
});

// Initialize
updateDisplay();
updateHistory();