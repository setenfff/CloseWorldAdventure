import { obstacles } from "./Obstacle.js";
import { Bullet, bullets } from "./Bullet.js";
import { StrengthenedBullet, strengthenedBullets } from "./Skill.js";
export class Player {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.x = canvas.width / 2; // 玩家初始 x 坐标
        this.y = canvas.height / 2; // 玩家初始 y 坐标
        this.radius = 10; // 玩家半径
        this.shield = 0; // 玩家目前所持护盾
        this.speed = 2; // 玩家移动速度
        this.health = 100; // 玩家生命值
        this.currentHealth = 100; // 玩家的生命值上限
        this.score = 0; // 玩家得分
        this.vx = 0; // 水平速度
        this.vy = 0; // 垂直速度
        this.isDead = false; // 玩家是否死亡
        this.damage = 10; // 玩家的伤害
        this.closeAttackDistance = 50; // 玩家近战攻击距离
        this.knockbackDistance = 40; // 玩家近战击退距离
        this.attackCooldown = 0; // 攻击冷却时间
        this.isOnCooldown = false; // 爆炸箭冷却时间
        this.attackCooldownTime = 59; // 攻击冷却时间阈值
        this.animationFrame = 0; // 玩家动画帧
        this.animationFrameTime = 59; // 玩家动画帧阈值
        this.isCloseAttack = false; // 玩家是否近战攻击
        this.isShootArrow = false; // 玩家是否射箭
        this.direction = "s"; // 玩家朝向
        this.rewardReceived = {
            damage: false,
            current: false
        };
    }

    // 函数处理玩家受到击退效果
    knockback(knockbackDistance, knockbackDirectionX, knockbackDirectionY) {
        const newX = this.x + knockbackDistance * knockbackDirectionX;
        const newY = this.y + knockbackDistance * knockbackDirectionY;

        // 检查是否越界，如果不越界，更新玩家的位置
        if (newX >= 0 && newX <= this.canvas.width && newY >= 0 && newY <= this.canvas.height) {
            this.x = newX;
            this.y = newY;
        }

        this.avoidObstacles();
    }

    damageByMonsterBullet(monsterbullet) {
        if (player.shield == 0) {
            player.health -= 10;
        }
        else {
            player.shield -= 10;
        }
        let directionX = monsterbullet.vx / monsterbullet.speed;
        let directionY = monsterbullet.vy / monsterbullet.speed;
        this.knockback(20, directionX, directionY);
    }

    // 处理玩家的移动
    move() {
        this.x += this.vx;
        this.y += this.vy;

        // 检查是否越界，如果越界，限制玩家在画布内
        if (this.x < this.radius) {
            this.x = this.radius;
        } else if (this.x > this.canvas.width - this.radius) {
            this.x = this.canvas.width - this.radius;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
        } else if (this.y > this.canvas.height - this.radius) {
            this.y = this.canvas.height - this.radius;
        }

        this.avoidObstacles();

        // 攻击冷却时间计算
        if (this.attackCooldown > 0) {
            this.attackCooldown++;
        }
        else if (this.attackCooldown == 0) {
            // 确保蓄力时不会被中断，除非松开鼠标
            if (this.isShootArrow) {
                this.attackCooldown = 60
            }
        }
        if (this.attackCooldown > this.attackCooldownTime) {
            if (!this.isShootArrow) {
                this.attackCooldown = 0;
            }
            this.isCloseAttack = false;
        }
    }

    // 避开障碍物
    avoidObstacles() {
        for (let i = 0; i < obstacles.length; i++) {
            let dx = this.x - obstacles[i].x;
            let dy = this.y - obstacles[i].y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.radius + obstacles[i].radius) {
                let avoidDistance = this.radius + obstacles[i].radius - distance;
                let directionX = dx / distance;
                let directionY = dy / distance;
                let newX = this.x + directionX * avoidDistance;
                let newY = this.y + directionY * avoidDistance;
                this.x = newX;
                this.y = newY;
            }
        }
    }

    // 玩家射箭
    shootArrow(x, y) {
        let dx = x - player.x;
        let dy = y - player.y;
        let length = Math.sqrt(dx * dx + dy * dy);
        let bulletSpeed = 5;
        let damage = this.damage;
        if (this.attackCooldown < this.attackCooldownTime) {
            damage += this.damage * (this.attackCooldown / this.attackCooldownTime);
            bulletSpeed += 10 * (this.attackCooldown / this.attackCooldownTime);
        }
        else {
            bulletSpeed = 15;
            damage = 20;
        }
        let bulletVX = (dx / length) * bulletSpeed;
        let bulletVY = (dy / length) * bulletSpeed;
        if (!this.isOnCooldown) {
            strengthenedBullets.push(new StrengthenedBullet(player.x, player.y, bulletVX, bulletVY, bulletSpeed, canvas));
            this.isOnCooldown = true;
            setTimeout(() => {
                this.isOnCooldown = false;
            }, 10000);
        }
        if (strengthenedBullets.length == 0) {
            bullets.push(new Bullet(player.x, player.y, bulletVX, bulletVY, damage, bulletSpeed, canvas));
        }
    }

    // 绘制玩家
    draw() {
        let imageDirectionX = 48 * Math.floor(this.animationFrame / 10);
        let imageDirectionY = 0;
        let isWalking = false;
        if (this.vx != 0 || this.vy != 0) {
            isWalking = true;
        }
        // 走路时动作
        if (isWalking) {
            if (this.direction === "s") {
                imageDirectionY = 48 * 4;
            }
            else if (this.direction === "w") {
                imageDirectionY = 48 * 6;
            }
            else if (this.direction === "a") {
                imageDirectionY = 48 * 7;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 5;
            }
        }
        // 在原地的动作
        else {
            if (this.direction === "s") {
                imageDirectionY = 48 * 0;
            }
            else if (this.direction === "w") {
                imageDirectionY = 48 * 2;
            }
            else if (this.direction === "a") {
                imageDirectionY = 48 * 3;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 1;
            }
        }
        // 死亡动画
        if (this.health <= 0) {
            if (this.animationFrameTime === 59 && this.animationFrame != 0) {
                this.animationFrame = 0;
                this.animationFrameTime = 180;
            }
            imageDirectionY = 48 * 12;
            if (this.animationFrame < 30) {
                imageDirectionX = 48 * 0;
            }
            else if (this.animationFrame < 60) {
                imageDirectionX = 48 * 1;
            }
            else if (this.animationFrame < 180) {
                imageDirectionX = 48 * 2;
            }
            if (this.animationFrame === 180) {
                this.isDead = true;
            }
            this.ctx.drawImage(playerImage, imageDirectionX, imageDirectionY, 48, 48, this.x - this.radius - 14 * 1.5, this.y - this.radius - 22 * 1.5, 72, 72);
            this.animationFrame++;
            return;
        }
        // 近战挥刀动作
        if (this.isCloseAttack) {
            if (this.direction === "s") {
                imageDirectionY = 48 * 8;
            }
            else if (this.direction === "w") {
                imageDirectionY = 48 * 10;
            }
            else if (this.direction === "a") {
                imageDirectionY = 48 * 11;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 9;
            }
            imageDirectionX = 48 * Math.floor(this.attackCooldown / 15);
        }
        // 蓄力拉弓动作
        if (this.isShootArrow) {
            if (this.direction === "a") {
                imageDirectionY = 48 * 14;
            }
            else if (this.direction === "d") {
                imageDirectionY = 48 * 13;
            }
            imageDirectionX = 48 * Math.floor(this.attackCooldown / 15);
            if (this.attackCooldown > 45) {
                imageDirectionX = 48 * 2;
            }
        }
        if (this.animationFrame < this.animationFrameTime) {
            this.animationFrame++;
        }
        else {
            this.animationFrame = 0;
        }

        this.ctx.drawImage(playerImage, imageDirectionX, imageDirectionY, 48, 48, this.x - this.radius - 18 * 1.5, this.y - this.radius - 25 * 1.5, 72, 72);

        // 实际碰撞位置显示
        // this.ctx.beginPath();
        // this.ctx.fillStyle = "#f0149c";
        // this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // this.ctx.fill();
    }

    // 是否接受奖励
    receiveReward(type, value, message) {
        if (!this.rewardReceived[type]) {
            if (type === 'current') {
                this.increaseCurrentHealth(value);
            } else {
                this.applyDamageBoost(value);
            }
            this.rewardReceived[type] = true;
            alert(message);
        }
    }

    // 实现伤害提升逻辑
    applyDamageBoost(value) {
        this.damage += value;
        //Bullet.damage += value;
    }

    // 实现生命上限提升逻辑
    increaseCurrentHealth(value) {
        this.currentHealth += value;
    }
}

export const canvas = document.getElementById("Canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
export const player = new Player(canvas);
let playerImage = new Image();
playerImage.src = "./res/player.png";