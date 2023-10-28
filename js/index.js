class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.x = canvas.width / 2; // 玩家初始 x 坐标
        this.y = canvas.height / 2; // 玩家初始 y 坐标
        this.radius = 10; // 玩家半径
        this.speed = 5; // 玩家移动速度
        this.health = 100; // 玩家生命值
        this.score = 0; // 玩家得分
        this.vx = 0; // 水平速度
        this.vy = 0; // 垂直速度
    }

    // 函数处理玩家受到击退效果
    knockback(knockbackDistance, knockbackDirectionX, knockbackDirectionY) {
        const newX = this.x + knockbackDistance * knockbackDirectionX;
        const newY = this.y + knockbackDistance * knockbackDirectionY;

        // 检查是否越界，如果不越界，更新玩家的位置
        if (newX >= 0  && newX <= this.canvas.width && newY >= 0 && newY <= this.canvas.height) {
            this.x = newX;
            this.y = newY;
        }
    }

    // 处理玩家的移动
    move() {
        this.x += this.vx;
        this.y += this.vy;

        // 检查是否越界，如果越界，限制玩家在画布内
        if (this.x < this.radius) {
            this.x = this.radius;
        } else if (this.x> this.canvas.width - this.radius ) {
            this.x = this.canvas.width - this.radius;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
        } else if (this.y> this.canvas.height - this.radius ) {
            this.y = this.canvas.height - this.radius;
        }
    }

    // 绘制玩家
    draw() {
        this.ctx.fillStyle = "blue";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

class Bullet {
    constructor(x, y, vx, vy, speed, canvas) {
        this.x = x; // 子弹 x 坐标
        this.y = y; // 子弹 y 坐标
        this.vx = vx; // 水平速度
        this.vy = vy; // 垂直速度
        this.speed = speed; // 子弹速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 5; // 子弹半径
    }

    // 处理子弹的移动
    move() {
        this.x += this.vx;
        this.y += this.vy;
    }

    // 绘制子弹
    draw() {
        this.ctx.fillStyle = "red";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
}

class Monster {
    constructor(x, y, distance, canvas) {
        this.x = x; // 怪物 x 坐标
        this.y = y; // 怪物 y 坐标
        this.vx = 0; // 水平速度
        this.vy = 0; // 垂直速度
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.radius = 15; // 怪物半径
        this.speed = 2; // 怪物移动速度
        this.health = 100; // 怪物生命值
        this.attackCooldown = 0; // 攻击冷却时间
        this.attackCooldownTime = 2000; // 攻击冷却时间阈值
        this.pursuitPlayerDistance = distance; // 怪物追踪玩家的距离阈值
    }

    // 处理怪物攻击玩家
    attackPlayer(player, directionX, directionY) {
        if (this.attackCooldown > 0) {
            return;
        }
        else {
            this.attackCooldown = this.attackCooldownTime;
            player.health -= 10;
            player.knockback(20, directionX, directionY);
        }
    }

    // 处理怪物追踪玩家
    pursuitPlayer(player) {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        let directionX = (player.x - this.x) / distanceToPlayer;
        let directionY = (player.y - this.y) / distanceToPlayer;
        if (distanceToPlayer > this.radius + player.radius + 5) {
            this.x += directionX * this.speed;
            this.y += directionY * this.speed;
        }
        else {
            this.attackPlayer(player, directionX, directionY);
        }
    }

    // 处理怪物的游荡
    wander() {
        // 游荡时速度慢一点
        const speed = 1.5;
        // 怪物游荡时随机改变方向
        if (Math.random() < 0.05) { // 根据需要调整游荡频率
            this.vx = (Math.random() - 0.5) * speed;
            this.vy = (Math.random() - 0.5) * speed;
        }

        // 限制怪物的游荡范围
        let minX = this.x - 30; // 左边界的 x 坐标
        let minY = this.y - 30; // 上边界的 y 坐标
        let maxX = this.x + 30; // 右边界的 x 坐标
        let maxY = this.y + 30; // 下边界的 y 坐标

        // 检查怪物是否越界，如果是，则反向移动
        if (this.x < minX || this.x > maxX) {
            this.vx *= -1;
        }
        if (this.y < minY || this.y > maxY) {
            this.vy *= -1;
        }

        if (this.x + this.vx < this.radius || this.x + this.vx > this.canvas.width - this.radius) {
            this.vx = 0;
        }
        if (this.y + this.vy < this.radius || this.y + this.vy > this.canvas.height - this.radius) {
            this.vy = 0;
        }
        // 移动怪物
        this.x += this.vx;
        this.y += this.vy;
    }

    // 计算怪物到玩家的距离
    getDistanceToPlayer(player) {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        return distanceToPlayer;
    }

    // 处理怪物的移动
    move(player) {
        // 添加游荡效果
        const distanceToPlayer = this.getDistanceToPlayer(player);

        // 如果距离玩家很近，怪物会追踪玩家
        if (distanceToPlayer < this.pursuitPlayerDistance) {
            this.pursuitPlayer(player);
        }
        else {
            this.wander();
        }
    }

    // 处理怪物受到击退效果
    knockback(knockbackDistance, knockbackDirectionX, knockbackDirectionY) {
        let newX = this.x + knockbackDistance * knockbackDirectionX;
        let newY = this.y + knockbackDistance * knockbackDirectionY;

        if (
            newX < this.radius ||
            newX > canvas.width - this.radius ||
            newY < this.radius ||
            newY > canvas.height - this.radius
        ) {
            return;
        }

        this.x = newX;
        this.y = newY;
    }

    // 处理怪物受到子弹伤害
    damageByBullet(bullet) {
        this.health -= 10;
        let directionX = bullet.vx / bullet.speed;
        let directionY = bullet.vy / bullet.speed;
        this.knockback(20, directionX, directionY);
    }

    // 绘制怪物
    draw() {
        this.ctx.fillStyle = "red";
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = "gray";
        this.ctx.fillRect(this.x - 15, this.y - this.radius - 10, 30, 5);

        this.ctx.fillStyle = "green";
        let healthBarWidth = (this.health / 100) * 30;
        this.ctx.fillRect(this.x - 15, this.y - this.radius - 10, healthBarWidth, 5);
    }
}

const canvas = document.getElementById("Canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const player = new Player(canvas);
const bullets = [];
const monsters = [];
const maxMonsters = 5;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

canvas.addEventListener("click", (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const dx = mouseX - player.x;
    const dy = mouseY - player.y;
    const bulletSpeed = 15;
    const length = Math.sqrt(dx * dx + dy * dy);
    const bulletVX = (dx / length) * bulletSpeed;
    const bulletVY = (dy / length) * bulletSpeed;
    bullets.push(new Bullet(player.x, player.y, bulletVX, bulletVY, bulletSpeed, canvas));
});

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);

// 处理按键按下事件
function handleKeyDown(event) {
    switch (event.key) {
        case "w":
            player.vy = -player.speed; // 上
            break;
        case "s":
            player.vy = player.speed; // 下
            break;
        case "a":
            player.vx = -player.speed; // 左
            break;
        case "d":
            player.vx = player.speed; // 右
            break;
    }
}

// 处理按键松开事件
function handleKeyUp(event) {
    switch (event.key) {
        case "w":
        case "s":
            player.vy = 0; // 停止垂直移动
            break;
        case "a":
        case "d":
            player.vx = 0; // 停止水平移动
            break;
    }
}

// 处理子弹的移动
function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].move();

        if (
            bullets[i].x < 0 ||
            bullets[i].x > canvas.width ||
            bullets[i].y < 0 ||
            bullets[i].y > canvas.height
        ) {
            bullets.splice(i, 1); // 移除超出画布的子弹
            i--;
        }
    }
}

// 生成怪物
function generateMonsters() {
    if (monsters.length == 0) {
        let pursuitPlayerDistance;
        if (canvas.width < canvas.height) {
            pursuitPlayerDistance = canvas.width / 2;
        }
        else {
            pursuitPlayerDistance = canvas.height / 2;
        }
        for (let i = 0; i < maxMonsters; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;

            if (
                Math.abs(x - player.x) < 100 &&
                Math.abs(y - player.y) < 100
            ) {
                i--;
                continue;
            }

            if (
                x < monsters.radius ||
                x > canvas.width - monsters.radius ||
                y < monsters.radius ||
                y > canvas.height - monsters.radius
            ) {
                i--;
                continue;
            }
            
            monsters.push(new Monster(x, y, pursuitPlayerDistance,canvas));
        }
    }
}

// 处理怪物的移动
function moveMonsters() {
    for (let i = 0; i < monsters.length; i++) {
        monsters[i].move(player);
        if (monsters[i].attackCooldown > 0) {
            monsters[i].attackCooldown -= 16; // 每帧减少冷却时间
        }
    }
}

// 检查子弹和怪物的碰撞
function checkBulletMonsterCollision(bullets, monsters, player) {
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < monsters.length; j++) {
            let dx = bullets[i].x - monsters[j].x;
            let dy = bullets[i].y - monsters[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bullets[i].radius + monsters[j].radius) {
                monsters[j].damageByBullet(bullets[i]);
                if (monsters[j].health <= 0) {
                    monsters.splice(j, 1); // 移除生命值为 0 的怪物
                    player.score += 10; // 增加玩家得分
                }
                bullets.splice(i, 1); // 移除击中的子弹
                i--;
                break;
            }
        }
    }
}

// 绘制画面
function draw() {
    player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
    player.ctx.fillStyle = "black";
    player.ctx.font = "20px Arial";
    player.ctx.fillText("Health: " + player.health, 10, 30);
    player.ctx.fillText("Score: " + player.score, 10, 60);
    player.draw();
    if (player.health <= 0) {
        player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
        return;
    }
    bullets.forEach((bullet) => bullet.draw());
    monsters.forEach((monster) => monster.draw());
}

// 游戏循环
function gameLoop() {
    player.move();
    moveBullets();
    moveMonsters();
    checkBulletMonsterCollision(bullets, monsters, player);
    draw();

    if (monsters.length == 0) {
        setTimeout(function () {
            generateMonsters();
        }, 5000);
    }
    if (player.health <= 0) {
        //cancelAnimationFrame(animationFrameId);
        player.ctx.clearRect(0, 0, player.canvas.width, player.canvas.height);
        gameOver();
    }
    animationFrameId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    // 显示游戏结束屏幕
    cancelAnimationFrame(animationFrameId);
    let canvas = document.getElementById("Canvas");
    canvas.style.display = "none";
    let gameOverScreen = document.getElementById("gameOverScreen");
    gameOverScreen.style.display = "block";
    gameOverScreen.style.width = canvas.width + "px";
    gameOverScreen.style.height = canvas.height + "px";

    // 显示玩家的分数
    let scoreDisplay = document.getElementById("scoreDisplay");
    scoreDisplay.textContent = player.score;

    // 监听重新开始按钮的点击事件
    let restartButton = document.getElementById("restartButton");
    restartButton.addEventListener("click", () => {

        // 隐藏游戏结束屏幕
        gameOverScreen.style.display = "none";
        canvas.style.display = "block";
        // 重置游戏状态
        player.health = 100;
        player.score = 0;
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        bullets.length = 0;
        monsters.length = 0;
        // 重新开始游戏循环或其他游戏逻辑
    });
}

let animationFrameId;
gameLoop();