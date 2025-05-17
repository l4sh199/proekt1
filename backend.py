from flask import Flask, request, jsonify, g
import sqlite3
import os
import hashlib
import secrets
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATABASE_PATH = r'D:\rpg\registrs.db'

app.config.update({
    'SECRET_KEY': secrets.token_hex(32),
    'DATABASE': DATABASE_PATH,
    'PEPPER': 'your-random-pepper-string'
})

def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                level INTEGER DEFAULT 1,
                gold INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        db.commit()

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
        db = g._database = sqlite3.connect(DATABASE_PATH)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def hash_password(password):
    salt = secrets.token_hex(16)
    return hashlib.pbkdf2_hmac(
        'sha256',
        (password + app.config['PEPPER']).encode(),
        salt.encode(),
        100000
    ).hex() + ':' + salt

def verify_password(stored_hash, password):
    if ':' not in stored_hash:
        return False
    hashed, salt = stored_hash.split(':')
    new_hash = hashlib.pbkdf2_hmac(
        'sha256',
        (password + app.config['PEPPER']).encode(),
        salt.encode(),
        100000
    ).hex()
    return hashed == new_hash

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({'error': 'Все поля обязательны'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('SELECT 1 FROM players WHERE username = ? OR email = ?', (username, email))
        if cursor.fetchone():
            return jsonify({'error': 'Пользователь уже существует'}), 400
        
        password_hash = hash_password(password)
        
        cursor.execute('''
            INSERT INTO players (username, email, password_hash)
            VALUES (?, ?, ?)
        ''', (username, email, password_hash))
        
        db.commit()
        
        cursor.execute('SELECT id, username, level, gold FROM players WHERE id = ?', (cursor.lastrowid,))
        player = cursor.fetchone()
        
        return jsonify(dict(player)), 201
        
    except Exception as e:
        print(f"Ошибка регистрации: {str(e)}")
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return jsonify({'error': 'Логин и пароль обязательны'}), 400
        
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            SELECT id, username, password_hash, level, gold FROM players
            WHERE username = ?
        ''', (username,))
        
        player = cursor.fetchone()
        
        if not player:
            return jsonify({'error': 'Пользователь не найден'}), 404
            
        if not verify_password(player['password_hash'], password):
            return jsonify({'error': 'Неверный пароль'}), 401
            
        return jsonify({
            'id': player['id'],
            'username': player['username'],
            'level': player['level'],
            'gold': player['gold']
        }), 200
        
    except Exception as e:
        print(f"Ошибка входа: {str(e)}")
        return jsonify({'error': 'Внутренняя ошибка сервера'}), 500

@app.route('/api/player/<int:player_id>', methods=['GET'])
def get_player(player_id):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            SELECT id, username, level, gold FROM players WHERE id = ?
        ''', (player_id,))
        
        player = cursor.fetchone()
        if player:
            return jsonify(dict(player)), 200
        return jsonify({'error': 'Игрок не найден'}), 404
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"Инициализация БД по пути: {DATABASE_PATH}")
    print(f"Права на запись: {os.access(os.path.dirname(DATABASE_PATH), os.W_OK)}")
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)