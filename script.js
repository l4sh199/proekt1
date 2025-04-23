// Пример функции для загрузки рейтинга с сервера
async function loadRatingFromServer() {
    try {
        const response = await fetch('https://your-api.com/rating');
        const data = await response.json();
        ratingData = data;
        updateRatingTable();
    } catch (error) {
        console.error('Ошибка загрузки рейтинга:', error);
    }
}

// Пример функции для сохранения результата
async function savePlayerResult() {
    try {
        const response = await fetch('https://your-api.com/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: "Игрок", // Можно добавить поле для ввода имени
                level: game.level,
                gold: game.gold
            })
        });
        const result = await response.json();
        console.log('Результат сохранен:', result);
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
}
// Функции для работы с API рейтинга
async function loadRatingFromServer() {
    try {
        const response = await fetch('http://localhost:5000/api/rating');
        if (!response.ok) throw new Error('Ошибка сети');
        return await response.json();
    } catch (error) {
        console.error('Ошибка загрузки рейтинга:', error);
        return [];
    }
}

async function savePlayerResult(playerName, level, gold) {
    try {
        const response = await fetch('http://localhost:5000/api/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: playerName,
                level: level,
                gold: gold
            })
        });
        if (!response.ok) throw new Error('Ошибка сохранения');
        return await response.json();
    } catch (error) {
        console.error('Ошибка сохранения результата:', error);
        return null;
    }
}

// Обновленная функция для показа рейтинга
async function showRating() {
    const ratingContainer = document.getElementById('rating-container');
    const ratingBody = document.getElementById('rating-body');
    
    ratingContainer.style.display = 'flex';
    ratingBody.innerHTML = '<tr><td colspan="4">Загрузка данных...</td></tr>';
    
    try {
        const ratingData = await loadRatingFromServer();
        
        // Добавляем текущего игрока, если его нет в рейтинге
        const playerExists = ratingData.some(p => p.name === game.playerName);
        if (!playerExists && game.playerName) {
            ratingData.push({
                name: game.playerName,
                level: game.level,
                gold: game.gold
            });
        }
        
        // Сортируем и ограничиваем топ-10
        const sortedRating = ratingData.sort((a, b) => {
            if (b.level !== a.level) return b.level - a.level;
            return b.gold - a.gold;
        }).slice(0, 10);
        
        // Очищаем и заполняем таблицу
        ratingBody.innerHTML = '';
        sortedRating.forEach((player, index) => {
            const row = document.createElement('tr');
            if (player.name === game.playerName) {
                row.style.fontWeight = 'bold';
                row.style.color = '#f95959';
            }
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.level}</td>
                <td>${player.gold}</td>
            `;
            
            ratingBody.appendChild(row);
        });
    } catch (error) {
        ratingBody.innerHTML = '<tr><td colspan="4">Ошибка загрузки рейтинга</td></tr>';
    }
}

// Добавляем поле для имени игрока в игре
const game = {
    // ... остальные свойства ...
    playerName: '',
    // ...
};

// Обновленная инициализация игры
function init() {
    // ... существующий код ...
    
    // Запрашиваем имя игрока
    game.playerName = prompt('Введите ваше имя для рейтинга:', 'Игрок') || 'Игрок';
    
    // Обновляем кнопку рейтинга
    document.getElementById('show-rating').addEventListener('click', showRating);
    document.getElementById('close-rating').addEventListener('click', hideRating);
    
    // Сохраняем результат при закрытии страницы
    window.addEventListener('beforeunload', async () => {
        await savePlayerResult(game.playerName, game.level, game.gold);
        saveGame(); // сохраняем локальные данные
    });
}
function updateHealth() {
  if (!elements.mobHealth) {
    console.error('Элемент mobHealth не найден');
    return;
  }
  const mob = game.mobs[game.currentMob];
  if (!mob) {
    console.error('Моб не найден');
    return;
  }
  const percent = (mob.health / mob.maxHealth) * 100;
  const healthWidth = elements.mobHealth.offsetWidth;
  if (healthWidth === 0) {
    console.error('Ширина элемента mobHealth равна 0');
    return;
  }
  elements.mobHealthFill.style.width = `${(percent / 100) * healthWidth}px`;
}function updateHealth() {
  if (!elements.mobHealth) {
    console.error('Элемент mobHealth не найден');
    return;
  }
  const mob = game.mobs[game.currentMob];
  if (!mob) {
    console.error('Моб не найден');
    return;
  }
  const percent = (mob.health / mob.maxHealth) * 100;
  const healthWidth = elements.mobHealth.offsetWidth;
  if (healthWidth === 0) {
    console.error('Ширина элемента mobHealth равна 0');
    return;
  }
  elements.mobHealthFill.style.width = `${(percent / 100) * healthWidth}px`;
}function updateHealth() {
  const mob = game.mobs[game.currentMob];
  const percent = (mob.health / mob.maxHealth) * 100;
  const healthWidth = elements.mobHealth.offsetWidth;
  elements.mobHealthFill.style.width = `${(percent / 100) * healthWidth}px`;
  elements.mobHpText.textContent = `${mob.health}/${mob.maxHealth}`;
}