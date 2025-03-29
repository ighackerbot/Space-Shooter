const gameContainer = document.querySelector('.game-container');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const gameOverScreen = document.getElementById('gameOver');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');

let score = 0;
let health = 100;
let isPlaying = true;
let playerX = 375;
let playerY = 500;
let keys = {};
let bullets = [];
let enemies = [];
let enemySpawnInterval;

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('keydown', (e) => {
    if (e.key === ' ' && isPlaying) {
        shoot();
    }
});

function shoot() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    bullet.style.left = (playerX + 23) + 'px';
    bullet.style.top = playerY + 'px';
    gameContainer.appendChild(bullet);
    bullets.push(bullet);
}

function movePlayer() {
    if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= 5;
    }
    if (keys['ArrowRight'] && playerX < 750) {
        playerX += 5;
    }
    if (keys['ArrowUp'] && playerY > 0) {
        playerY -= 5;
    }
    if (keys['ArrowDown'] && playerY < 550) {
        playerY += 5;
    }
    
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
}

function createEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = Math.random() * 760 + 'px';
    enemy.style.top = '-40px';
    gameContainer.appendChild(enemy);
    enemies.push(enemy);
}

function moveBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        const top = parseInt(bullet.style.top);
        bullet.style.top = (top - 7) + 'px';
        
        if (top < 0) {
            bullet.remove();
            bullets.splice(i, 1);
        }
    }
}

function moveEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const top = parseInt(enemy.style.top);
        enemy.style.top = (top + 3) + 'px';
        
        if (top > playerY && top < playerY + 50) {
            const enemyLeft = parseInt(enemy.style.left);
            if (enemyLeft > playerX - 40 && enemyLeft < playerX + 50) {
                health -= 20;
                healthElement.textContent = health;
                enemy.remove();
                enemies.splice(i, 1);
                
                if (health <= 0) {
                    gameOver();
                }
            }
        }
        
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            const bulletLeft = parseInt(bullet.style.left);
            const bulletTop = parseInt(bullet.style.top);
            const enemyLeft = parseInt(enemy.style.left);
            
            if (bulletTop > top && bulletTop < top + 40 &&
                bulletLeft > enemyLeft - 4 && bulletLeft < enemyLeft + 40) {
                bullet.remove();
                bullets.splice(j, 1);
                enemy.remove();
                enemies.splice(i, 1);
                score += 10;
                scoreElement.textContent = score;
            }
        }
        
        if (top > 600) {
            enemy.remove();
            enemies.splice(i, 1);
        }
    }
}

function gameOver() {
    isPlaying = false;
    clearInterval(enemySpawnInterval);
    gameOverScreen.style.display = 'block';
    finalScoreElement.textContent = score;
}

function restartGame() {
    score = 0;
    health = 100;
    isPlaying = true;
    playerX = 375;
    playerY = 500;
    scoreElement.textContent = score;
    healthElement.textContent = health;
    bullets.forEach(bullet => bullet.remove());
    enemies.forEach(enemy => enemy.remove());
    bullets = [];
    enemies = [];
    gameOverScreen.style.display = 'none';
    enemySpawnInterval = setInterval(createEnemy, 2000);
}

function gameLoop() {
    if (isPlaying) {
        movePlayer();
        moveBullets();
        moveEnemies();
        requestAnimationFrame(gameLoop);
    }
}

restartButton.addEventListener('click', restartGame);
gameLoop();
enemySpawnInterval = setInterval(createEnemy, 2000); 