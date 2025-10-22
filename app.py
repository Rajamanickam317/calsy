from flask import Flask, request, jsonify
from flask_cors import CORS
import math

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Calculator operations
def add(a, b):
    """Addition operation"""
    return a + b

def subtract(a, b):
    """Subtraction operation"""
    return a - b

def multiply(a, b):
    """Multiplication operation"""
    return a * b

def divide(a, b):
    """Division operation"""
    if b == 0:
        return None  # Return None for division by zero
    return a / b

def modulo(a, b):
    """Modulo operation"""
    if b == 0:
        return None
    return a % b

def square_root(a):
    """Square root operation"""
    if a < 0:
        return None
    return math.sqrt(a)

def square(a):
    """Square operation"""
    return a * a

def reciprocal(a):
    """Reciprocal operation"""
    if a == 0:
        return None
    return 1 / a

# Route: Home
@app.route('/')
def home():
    return jsonify({
        'message': 'Solid Calculator API',
        'version': '1.0',
        'endpoints': {
            '/api/calculate': 'POST - Perform basic calculations',
            '/api/special': 'POST - Perform special operations',
            '/api/history': 'GET - Get calculation history'
        }
    })

# Route: Basic Calculation
@app.route('/api/calculate', methods=['POST'])
def calculate():
    try:
        data = request.get_json()
        
        num1 = float(data.get('num1', 0))
        num2 = float(data.get('num2', 0))
        operation = data.get('operation', '')
        
        result = None
        
        # Perform operation based on operator
        if operation == '+':
            result = add(num1, num2)
        elif operation == '-':
            result = subtract(num1, num2)
        elif operation == '×' or operation == '*':
            result = multiply(num1, num2)
        elif operation == '÷' or operation == '/':
            result = divide(num1, num2)
        elif operation == '%':
            result = modulo(num1, num2)
        else:
            return jsonify({
                'error': 'Invalid operation',
                'message': f'Operation "{operation}" is not supported'
            }), 400
        
        # Check if operation failed (e.g., division by zero)
        if result is None:
            return jsonify({
                'error': 'Math error',
                'message': 'Cannot perform this operation (division by zero or invalid input)'
            }), 400
        
        return jsonify({
            'result': result,
            'operation': operation,
            'num1': num1,
            'num2': num2
        })
    
    except ValueError:
        return jsonify({
            'error': 'Invalid input',
            'message': 'Please provide valid numbers'
        }), 400
    except Exception as e:
        return jsonify({
            'error': 'Server error',
            'message': str(e)
        }), 500

# Route: Special Operations
@app.route('/api/special', methods=['POST'])
def special_operation():
    try:
        data = request.get_json()
        
        num = float(data.get('num', 0))
        operation = data.get('operation', '')
        
        result = None
        
        # Perform special operation
        if operation == 'sqrt':
            result = square_root(num)
        elif operation == 'square':
            result = square(num)
        elif operation == 'reciprocal':
            result = reciprocal(num)
        else:
            return jsonify({
                'error': 'Invalid operation',
                'message': f'Operation "{operation}" is not supported'
            }), 400
        
        # Check if operation failed
        if result is None:
            return jsonify({
                'error': 'Math error',
                'message': 'Cannot perform this operation (negative square root or division by zero)'
            }), 400
        
        return jsonify({
            'result': result,
            'operation': operation,
            'num': num
        })
    
    except ValueError:
        return jsonify({
            'error': 'Invalid input',
            'message': 'Please provide a valid number'
        }), 400
    except Exception as e:
        return jsonify({
            'error': 'Server error',
            'message': str(e)
        }), 500

# Route: Health Check
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'message': 'Calculator API is running'
    })

# Route: Calculate Expression (Advanced)
@app.route('/api/evaluate', methods=['POST'])
def evaluate():
    """Evaluate a mathematical expression"""
    try:
        data = request.get_json()
        expression = data.get('expression', '')
        
        # Replace calculator symbols with Python operators
        expression = expression.replace('×', '*').replace('÷', '/')
        
        # Safely evaluate the expression
        # Note: In production, use a proper expression parser for security
        result = eval(expression, {"__builtins__": {}}, {
            "sqrt": math.sqrt,
            "pow": pow,
            "abs": abs,
            "round": round
        })
        
        return jsonify({
            'result': result,
            'expression': expression
        })
    
    except ZeroDivisionError:
        return jsonify({
            'error': 'Math error',
            'message': 'Division by zero'
        }), 400
    except Exception as e:
        return jsonify({
            'error': 'Invalid expression',
            'message': str(e)
        }), 400

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Solid Calculator API Server")
    print("=" * 50)
    print("Server running on: http://localhost:5000")
    print("API Endpoints:")
    print("  - POST /api/calculate")
    print("  - POST /api/special")
    print("  - POST /api/evaluate")
    print("  - GET  /api/health")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)