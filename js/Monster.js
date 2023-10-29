import { obstacles } from "./Obstacle.js";
import { player } from "./Player.js";
import { canvas } from "./Player.js";

export class Monster {
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
    attackPlayer(directionX, directionY) {
        if (this.attackCooldown > 0) {
            return;
        }
        else {
            this.attackCooldown = this.attackCooldownTime;
            player.health -= 10;
            player.knockback(20, directionX, directionY);
        }
    }

    pursuitPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

        let directionX = dx / distanceToPlayer;
        let directionY = dy / distanceToPlayer;

        if (distanceToPlayer > this.radius + player.radius + 5) {
            // 怪物和玩家之间没有碰撞，可以直接追击
            this.x += directionX * this.speed;
            this.y += directionY * this.speed;
        } else {
            this.attackPlayer(directionX, directionY);
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

    // 计算怪物到玩家的距离
    getDistanceToPlayer() {
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let distanceToPlayer = Math.sqrt(dx * dx + dy * dy);
        return distanceToPlayer;
    }

    // 处理怪物的移动
    move() {
        // 添加游荡效果
        const distanceToPlayer = this.getDistanceToPlayer();

        // 如果距离玩家很近，怪物会追踪玩家
        if (distanceToPlayer < this.pursuitPlayerDistance) {
            this.pursuitPlayer();
        }
        else {
            this.wander();
        }

        this.avoidObstacles();
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

export const monsters = [];