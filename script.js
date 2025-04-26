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
  playerId: null,
    playerName: '',
  // В объект game
inventory: {
  items: [],
  maxSlots: 9
},
    // ... остальные свойства ...
    playerName: '',
    // ...
};

// Обновленная инициализация игры
async function init() {
  // Загружаем данные игрока
  const savedData = localStorage.getItem('playerData');
  if (!savedData) {
      window.location.href = 'first.html';
      return;
  }
  try {
    const response = await fetch(`http://localhost:5000/api/player/${game.playerId}`);
    if (response.ok) {
        const data = await response.json();
        game.level = data.level;
        game.gold = data.gold;
    }
} catch (error) {
    console.error('Ошибка загрузки данных:', error);
}
    
  const playerData = JSON.parse(savedData);
  game.playerId = playerData.id;
  game.playerName = playerData.name;
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
document.getElementById("about-button").addEventListener("click", function() {
    window.open("first.html", "_blank");
  });
  document.getElementById("about-link").href = "about.html";
  // Класс Item
class Item {
    constructor(name, description, icon, stats) {
      this.name = name;
      this.description = description;
      this.icon = icon;
      this.stats = stats;
    }
  }
  
  // Класс MobDrop
  class MobDrop {
    constructor(mob, item, chance) {
      this.mob = mob;
      this.item = item;
      this.chance = chance;
    }
  }
  
  // Класс CraftingRecipe
  class CraftingRecipe {
    constructor(name, description, ingredients, result) {
      this.name = name;
      this.description = description;
      this.ingredients = ingredients;
      this.result = result;
    }
  }
  
  // Класс Inventory
  class Inventory {
    constructor() {
      this.items = [];
    }
  
    addItem(item) {
      this.items.push(item);
    }
  
    craftItem(recipe) {
      // Проверяем, есть ли все ингредиенты в инвентаре
      for (let ingredient of recipe.ingredients) {
        if (!this.items.includes(ingredient)) {
          console.log("Не хватает ингредиентов для крафта");
          return;
        }
      }
  
      // Крафтим предмет
      let craftedItem = recipe.result;
      this.addItem(craftedItem);
      console.log(`Крафтим ${craftedItem.name}`);
    }
  }
  
  // Создаем предметы
  let slimeGel = new Item("Слизь", "Слизь, выпадающая из слайма", "slime_gel_icon", { health: 10 });
  let bone = new Item("Кость", "Кость, выпадающая из скелета", "bone_icon", { attack: 5 });
  let scale = new Item("Чешуя", "Чешуя, выпадающая из дракона", "scale_icon", { defense: 10 });
  let sword = new Item("Меч", "Меч, который увеличивает урон на 10%", "sword_icon", { attack: 10 });
  
  // Создаем рецепты крафта
  let swordRecipe = new CraftingRecipe("Меч", "Меч, который увеличивает урон на 10%", [slimeGel, bone, scale], sword);
  
  // Создаем инвентарь
  let inventory = new Inventory();
  
  // Добавляем предметы в инвентарь
  inventory.addItem(slimeGel);
  inventory.addItem(bone);
  inventory.addItem(scale);
  
  // Крафтим меч
  inventory.craftItem(swordRecipe);
  let clickCombo = 0;
let lastClickTime = 0;

mobElement.addEventListener('mousedown', function() {
    const now = Date.now();
    if (now - lastClickTime < 200) { // 200ms между кликами
        clickCombo++;
        showComboEffect(clickCombo);
    } else {
        clickCombo = 1;
    }
    lastClickTime = now;
    
    // Автоматические клики при удержании
    this.autoClickInterval = setInterval(() => {
        attack();
        clickCombo++;
        if (clickCombo % 5 === 0) showComboEffect(clickCombo);
    }, 100);
});

mobElement.addEventListener('mouseup', function() {
    clearInterval(this.autoClickInterval);
});
   
    // Сохранение в БД
    try {
      await fetch(`http://localhost:5000/api/player/${game.playerId}/update`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              level: game.level,
              gold: game.gold
          })
      });
  } catch (error) {
      console.error('Ошибка сохранения:', error);
  }
