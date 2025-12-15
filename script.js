// ==========================================================
// A. ส่วนเครื่องคิดเลขวิทยาศาสตร์ (หน่วยองศา)
// ==========================================================

const display = document.getElementById('display');
const buttons = document.querySelectorAll('.buttons .btn');
const equalButton = document.getElementById('equal');
const clearButton = document.getElementById('clear');

let currentExpression = '';
let isResultDisplayed = false;
const functionsWithParen = ['sin', 'cos', 'tan', 'log', 'sqrt'];

function updateDisplay(value) {
    if (value === '') {
        display.value = '0';
    } else {
        display.value = value;
    }
}

// *** ฟังก์ชันตรีโกณมิติที่คำนวณด้วยหน่วยองศา (Degrees) ***
// ----------------------------------------------------
// ฟังก์ชันแปลงองศาเป็นเรเดียน
function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

// ฟังก์ชัน Sine ที่รับค่าเป็นองศา
function sinD(degrees) {
    return Math.sin(degToRad(degrees));
}

// ฟังก์ชัน Cosine ที่รับค่าเป็นองศา
function cosD(degrees) {
    return Math.cos(degToRad(degrees));
}

// ฟังก์ชัน Tangent ที่รับค่าเป็นองศา
function tanD(degrees) {
    return Math.tan(degToRad(degrees));
}
// ----------------------------------------------------


// Event Listener หลักสำหรับปุ่มทั้งหมด
buttons.forEach(button => {
    button.addEventListener('click', () => {
        let value = button.value; // เปลี่ยนเป็น let เพื่อปรับค่า

        if (value === '=' || value === 'C') {
            return;
        }

        // ผูกวงเล็บเปิดเข้ากับฟังก์ชันที่กำหนด
        if (functionsWithParen.includes(value)) {
            value = value + '('; 
        }

        // จัดการเมื่อกดปุ่มหลังแสดงผลลัพธ์
        if (isResultDisplayed) {
            if (button.classList.contains('operator') || button.classList.contains('func')) {
                currentExpression += value;
            } else {
                currentExpression = value;
            }
            isResultDisplayed = false;
        } else {
            // ป้องกัน Operator/Function ซ้ำซ้อน
            const lastChar = currentExpression.slice(-1);
            const isOperator = button.classList.contains('operator');
            const isLastCharOperator = ['/', '*', '-', '+'].includes(lastChar);
            
            if (isOperator && isLastCharOperator) {
                currentExpression = currentExpression.slice(0, -1) + value;
            } else {
                currentExpression += value;
            }
        }
        
        updateDisplay(currentExpression);
    });
});

// Event Listener สำหรับปุ่ม 'C'
clearButton.addEventListener('click', () => {
    currentExpression = '';
    isResultDisplayed = false;
    updateDisplay('');
});

// Event Listener สำหรับปุ่ม '=' (ส่วนคำนวณ)
equalButton.addEventListener('click', () => {
    if (currentExpression === '') return; 

    try {
        let expressionToEvaluate = currentExpression;
        
        // 1. การแปลงสัญลักษณ์ Operator และฟังก์ชันตรีโกณมิติ
        expressionToEvaluate = expressionToEvaluate
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            // ใช้ฟังก์ชัน D-suffix สำหรับหน่วยองศา
            .replace(/sin\(/g, 'sinD(')
            .replace(/cos\(/g, 'cosD(')
            .replace(/tan\(/g, 'tanD(')
            // ฟังก์ชันอื่น ๆ ที่ไม่เกี่ยวกับมุม
            .replace(/log\(/g, 'Math.log(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/\^/g, '**'); 

        // 2. ป้องกันนิพจน์จบด้วย Operator
        const lastChar = expressionToEvaluate.slice(-1);
        if (['+', '-', '*', '/'].includes(lastChar)) {
            expressionToEvaluate = expressionToEvaluate.slice(0, -1);
        }
        
        let result = eval(expressionToEvaluate); 

        // 3. จัดการทศนิยมและ Error
        if (typeof result === 'number' && !Number.isFinite(result)) {
            updateDisplay('Error');
        } else if (typeof result === 'number' && result % 1 !== 0) {
             result = parseFloat(result.toFixed(10));
        }

        updateDisplay(result);
        currentExpression = String(result);
        isResultDisplayed = true;

    } catch (error) {
        updateDisplay('Syntax Error');
        currentExpression = '';
        isResultDisplayed = true;
    }
});


// ==========================================================
// B. ฟังก์ชันวิเคราะห์ตัวเลข (แยกตัวประกอบ / แปลงฐาน)
// ==========================================================

// 1. การแยกตัวประกอบเฉพาะ (Prime Factorization)
function primeFactorization(n) {
    if (n <= 1 || !Number.isInteger(n)) {
        return "โปรดใส่จำนวนเต็มบวกที่มากกว่า 1";
    }

    let factors = new Map();
    let tempN = n;

    while (tempN % 2 === 0) {
        factors.set(2, (factors.get(2) || 0) + 1);
        tempN /= 2;
    }

    let d = 3;
    while (d * d <= tempN) {
        while (tempN % d === 0) {
            factors.set(d, (factors.get(d) || 0) + 1);
            tempN /= d;
        }
        d += 2;
    }

    if (tempN > 1) {
        factors.set(tempN, (factors.get(tempN) || 0) + 1);
    }
    
    let parts = [];
    for (let [base, exponent] of factors.entries()) {
        if (exponent === 1) {
            parts.push(`${base}`);
        } else {
            parts.push(`${base}^${exponent}`); 
        }
    }
    return parts.join(' × ');
}

// เชื่อมโยงปุ่ม 'analyze-prime'
document.getElementById('analyze-prime').addEventListener('click', () => {
    const inputElement = document.getElementById('prime-input');
    const inputVal = parseInt(inputElement.value);
    const resultSpan = document.getElementById('prime-result');

    if (isNaN(inputVal) || inputVal <= 1) {
        resultSpan.textContent = "โปรดใส่จำนวนเต็มบวกที่มากกว่า 1";
        inputElement.value = '';
        return;
    }
    
    resultSpan.textContent = primeFactorization(inputVal);
    inputElement.value = '';
});

// 2. การแปลงฐานตัวเลข (Base Conversion)
function convertBase(decimalNumber, newBase) {
    if (newBase < 2 || newBase > 36) {
        return "ฐานต้องอยู่ระหว่าง 2 ถึง 36";
    }
    if (!Number.isInteger(decimalNumber) || decimalNumber < 0) {
        return "ต้องเป็นจำนวนเต็มที่ไม่ติดลบ";
    }
    
    return decimalNumber.toString(newBase).toUpperCase();
}

// เชื่อมโยงปุ่ม 'convert-base'
document.getElementById('convert-base').addEventListener('click', () => {
    const decInputEl = document.getElementById('base-dec-input');
    const baseInputEl = document.getElementById('base-n-input');

    const decInput = parseInt(decInputEl.value);
    const baseInput = parseInt(baseInputEl.value);
    const resultSpan = document.getElementById('base-result');

    if (isNaN(decInput) || isNaN(baseInput)) {
        resultSpan.textContent = "โปรดใส่ข้อมูลให้ครบถ้วน";
        return;
    }

    if (baseInput < 2 || baseInput > 36) {
        resultSpan.textContent = "ฐานต้องอยู่ระหว่าง 2 ถึง 36";
        return;
    }

    resultSpan.textContent = convertBase(decInput, baseInput);
    decInputEl.value = '';
    baseInputEl.value = '';
});

