# server.py
from flask import Flask, jsonify, request, g
import sqlite3
import os

app = Flask(__name__)
DATABASE = 'ratings.db'

# Функция для подключения к базе данных
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

# Инициализация базы данных
def init_db():
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                level INTEGER NOT NULL,
                gold INTEGER NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        db.commit()

# API endpoint для получения рейтинга
@app.route('/api/rating', methods=['GET'])
def get_rating():
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        SELECT name, level, gold 
        FROM players 
        ORDER BY level DESC, gold DESC 
        LIMIT 10
    ''')
    players = cursor.fetchall()
    return jsonify([{'name': p[0], 'level': p[1], 'gold': p[2]} for p in players])

# API endpoint для сохранения результата
@app.route('/api/save', methods=['POST'])
def save_result():
    data = request.json
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO players (name, level, gold)
        VALUES (?, ?, ?)
    ''', (data['name'], data['level'], data['gold']))
    db.commit()
    return jsonify({'status': 'success', 'id': cursor.lastrowid})

# Закрытие соединения с БД при завершении
@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    if not os.path.exists(DATABASE):
        init_db()
    app.run(debug=True)
@app.route('/api/login', methods=['POST'])
def player_login():
    data1 = request.json
    db = get_db()
    cursor = db.cursor()
    
    # Проверяем существование игрока
    cursor.execute('SELECT id, name, level, gold FROM players WHERE name = ?', (data1['name'],))
    player = cursor.fetchone()
    
    if not player:
        # Создаем нового игрока
        cursor.execute('''
            INSERT INTO players (name, level, gold)
            VALUES (?, 1, 0)
        ''', (data1['name'],))
        db.commit()
        player_id = cursor.lastrowid
        return jsonify({
            'id': player_id,
            'name': data1['name'],
            'level': 1,
            'gold': 0,
            'isNew': True
        })
    else:
        return jsonify({
            'id': player[0],
            'name': player[1],
            'level': player[2],
            'gold': player[3],
            'isNew': False
        })

@app.route('/api/player/<int:player_id>', methods=['GET'])
def get_player(player_id):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('SELECT name, level, gold FROM players WHERE id = ?', (player_id,))
    player = cursor.fetchone()
    
    if player:
        return jsonify({
            'name': player[0],
            'level': player[1],
            'gold': player[2]
        })
    else:
        return jsonify({'error': 'Player not found'}), 404