from flask import Flask, jsonify, request, g
import sqlite3
import os
from pathlib import Path

app = Flask(__name__)

# Путь к базе данных
DATABASE_PATH = r'D:\rpg\ratings.db'

def get_db():
    """Подключение к базе данных"""
    db = getattr(g, '_database', None)
    if db is None:
        # Создаем папку, если ее нет
        os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
        db = g._database = sqlite3.connect(DATABASE_PATH)
        db.row_factory = sqlite3.Row  # Для доступа к полям по имени
    return db

def init_db():
    """Инициализация базы данных"""
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        
        # Создаем таблицу игроков, если ее нет
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                level INTEGER DEFAULT 1,
                gold INTEGER DEFAULT 0,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Создаем таблицу рейтинга
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS leaderboard (
                player_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                score INTEGER DEFAULT 0,
                FOREIGN KEY(player_id) REFERENCES players(id)
            )
        ''')
        
        db.commit()

@app.teardown_appcontext
def close_connection(exception):
    """Закрытие соединения с БД"""
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

@app.route('/api/register', methods=['POST'])
def register_player():
    """Регистрация нового игрока"""
    data = request.json
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Пытаемся создать нового игрока
        cursor.execute('''
            INSERT INTO players (name, level, gold)
            VALUES (?, 1, 0)
        ''', (data['name'],))
        
        player_id = cursor.lastrowid
        
        # Добавляем в таблицу лидеров
        cursor.execute('''
            INSERT INTO leaderboard (player_id, name, score)
            VALUES (?, ?, 0)
        ''', (player_id, data['name']))
        
        db.commit()
        
        return jsonify({
            'id': player_id,
            'name': data['name'],
            'level': 1,
            'gold': 0,
            'message': 'Player registered successfully'
        })
        
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Player name already exists'}), 400

@app.route('/api/login', methods=['POST'])
def login_player():
    """Вход игрока"""
    data = request.json
    if not data or 'name' not in data:
        return jsonify({'error': 'Name is required'}), 400
    
    db = get_db()
    cursor = db.cursor()
    
    # Ищем игрока
    cursor.execute('''
        SELECT id, name, level, gold 
        FROM players 
        WHERE name = ?
    ''', (data['name'],))
    
    player = cursor.fetchone()
    
    if player:
        return jsonify(dict(player))
    else:
        return jsonify({'error': 'Player not found'}), 404

@app.route('/api/update', methods=['POST'])
def update_player():
    """Обновление данных игрока"""
    data = request.json
    if not data or 'id' not in data:
        return jsonify({'error': 'Player ID is required'}), 400
    
    db = get_db()
    cursor = db.cursor()
    
    try:
        # Обновляем основные данные
        cursor.execute('''
            UPDATE players 
            SET level = ?, gold = ?
            WHERE id = ?
        ''', (data.get('level', 1), data.get('gold', 0), data['id']))
        
        # Обновляем рейтинг (score = level * 100 + gold)
        score = data.get('level', 1) * 100 + data.get('gold', 0)
        cursor.execute('''
            UPDATE leaderboard
            SET score = ?, name = (SELECT name FROM players WHERE id = ?)
            WHERE player_id = ?
        ''', (score, data['id'], data['id']))
        
        db.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Player data updated'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    """Получение таблицы лидеров"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT p.id, p.name, p.level, p.gold, l.score,
               (SELECT COUNT(*) FROM leaderboard WHERE score >= l.score) AS rank
        FROM players p
        JOIN leaderboard l ON p.id = l.player_id
        ORDER BY l.score DESC
        LIMIT 10
    ''')
    
    leaderboard = []
    for row in cursor.fetchall():
        leaderboard.append(dict(row))
    
    return jsonify(leaderboard)

@app.route('/api/player/<int:player_id>', methods=['GET'])
def get_player(player_id):
    """Получение данных конкретного игрока"""
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute('''
        SELECT p.id, p.name, p.level, p.gold, l.score,
               (SELECT COUNT(*) FROM leaderboard WHERE score >= l.score) AS rank
        FROM players p
        JOIN leaderboard l ON p.id = l.player_id
        WHERE p.id = ?
    ''', (player_id,))
    
    player = cursor.fetchone()
    
    if player:
        return jsonify(dict(player))
    else:
        return jsonify({'error': 'Player not found'}), 404

if __name__ == '__main__':
    init_db()  # Инициализация БД при запуске
    app.run(debug=True, port=5000)