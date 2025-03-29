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
let lastShotTime = 0;
let currentWeapon = 'normal';
let gameLoopId = null;

const weaponCooldowns = {
    normal: 200,    // 200ms cooldown
    spread: 500,    // 500ms cooldown
    laser: 1000     // 1000ms cooldown
};

const shootSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
shootSound.volume = 0.2;

function initGame() {
    startGameLoop();
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);
restartButton.addEventListener('click', restartGame);

function handleKeyDown(e) {
    keys[e.key] = true;
    
    if (e.key === '1') currentWeapon = 'normal';
    if (e.key === '2') currentWeapon = 'spread';
    if (e.key === '3') currentWeapon = 'laser';
    
    if (e.key === ' ' && isPlaying) {
        const currentTime = Date.now();
        if (currentTime - lastShotTime >= weaponCooldowns[currentWeapon]) {
            shoot();
            lastShotTime = currentTime;
        }
    }
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

function createParticle(x, y, color = '#0ff') {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.background = color;
    gameContainer.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 500);
}

function shoot() {
    shootSound.currentTime = 0;
    shootSound.play().catch(() => {}); // Ignore autoplay errors

    player.classList.add('shooting');
    setTimeout(() => {
        player.classList.remove('shooting');
    }, 100);

    switch(currentWeapon) {
        case 'normal':
            createBullet(playerX + 23, playerY, 'normal');
            break;
        case 'spread':
            createBullet(playerX + 23, playerY, 'spread', -15);
            createBullet(playerX + 23, playerY, 'spread', 0);
            createBullet(playerX + 23, playerY, 'spread', 15);
            break;
        case 'laser':
            createBullet(playerX + 23, playerY, 'laser');
            break;
    }
}

function createBullet(x, y, type, angle = 0) {
    const bullet = document.createElement('div');
    bullet.className = `bullet ${type}`;
    bullet.style.left = x + 'px';
    bullet.style.top = y + 'px';
    bullet.style.transform = `rotate(${angle}deg)`;
    gameContainer.appendChild(bullet);
    bullets.push({ element: bullet, type, angle });
}

function movePlayer() {
    const speed = 5;
    if (keys['ArrowLeft'] && playerX > 0) {
        playerX -= speed;
    }
    if (keys['ArrowRight'] && playerX < 750) {
        playerX += speed;
    }
    if (keys['ArrowUp'] && playerY > 0) {
        playerY -= speed;
    }
    if (keys['ArrowDown'] && playerY < 550) {
        playerY += speed;
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
        const top = parseInt(bullet.element.style.top);
        
        let speed = 7;
        if (bullet.type === 'laser') speed = 10;
        if (bullet.type === 'spread') speed = 6;
        
        const angleRad = bullet.angle * Math.PI / 180;
        const newTop = top - speed * Math.cos(angleRad);
        const newLeft = parseInt(bullet.element.style.left) + speed * Math.sin(angleRad);
        
        bullet.element.style.top = newTop + 'px';
        bullet.element.style.left = newLeft + 'px';
        
        if (Math.random() < 0.3) {
            createParticle(
                newLeft + (Math.random() - 0.5) * 4,
                newTop + 7,
                bullet.type === 'laser' ? '#ff0' : '#0ff'
            );
        }
        
        if (newTop < 0 || newLeft < 0 || newLeft > 800) {
            bullet.element.remove();
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
            const bulletLeft = parseInt(bullet.element.style.left);
            const bulletTop = parseInt(bullet.element.style.top);
            const enemyLeft = parseInt(enemy.style.left);
            
            if (bulletTop > top && bulletTop < top + 40 &&
                bulletLeft > enemyLeft - 4 && bulletLeft < enemyLeft + 40) {
                bullet.element.remove();
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
    bullets.forEach(bullet => bullet.element.remove());
    enemies.forEach(enemy => enemy.remove());
    bullets = [];
    enemies = [];
    gameOverScreen.style.display = 'none';
    enemySpawnInterval = setInterval(createEnemy, 2000);
}

function startGameLoop() {
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (isPlaying) {
        movePlayer();
        moveBullets();
        moveEnemies();
        gameLoopId = requestAnimationFrame(gameLoop);
    }
}

// Start the game
initGame();
enemySpawnInterval = setInterval(createEnemy, 2000); 