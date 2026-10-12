// Gravity Rush - Modular Obstacles & Level Elements System
// Fully implements every element depicted in Reference Image 2
import { Physics } from '../engine/physics.js';

// Base Level Element
export class LevelElement {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    update(dt, player, audio, particles) {}
    draw(ctx) {}
}

// ==========================================
// 1. STATIC PLATFORM
// ==========================================
export class Platform extends LevelElement {
    constructor(x, y, w, h, options = {}) {
        super(x, y, w, h);
        this.type = 'platform';
        this.color = options.color || '#38bdf8'; // Cyan neon trim
        this.baseColor = options.baseColor || '#1e293b';
        this.isNarrow = options.isNarrow || false;
    }

    resolveCollision(player) {
        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x, this.y, this.w, this.h);
        if (res.collided) {
            // Push player out of penetration
            player.x += res.normalX * res.overlap;
            player.y += res.normalY * res.overlap;

            // Velocity reflection / damping
            const dot = player.vx * res.normalX + player.vy * res.normalY;
            if (dot < 0) {
                player.vx -= dot * res.normalX;
                player.vy -= dot * res.normalY;
            }

            // Ground detection
            if (res.normalY < -0.7 && player.gravityScale > 0) {
                player.setGrounded(this, res.normalX, res.normalY);
            } else if (res.normalY > 0.7 && player.gravityScale < 0) {
                // Grounded when ceiling walking in inverted gravity
                player.setGrounded(this, res.normalX, res.normalY);
            }
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        // Body fill
        ctx.fillStyle = this.baseColor;
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Tech panel line
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(this.x + 3, this.y + 4, this.w - 6, this.h - 8);

        // Glowing neon top & bottom trim
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, 3);
        ctx.fillRect(this.x, this.y + this.h - 2, this.w, 2);

        // Corner rivets
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#64748b';
        ctx.fillRect(this.x + 2, this.y + 3, 2, 2);
        ctx.fillRect(this.x + this.w - 4, this.y + 3, 2, 2);

        ctx.restore();
    }
}

// ==========================================
// 2. MOVING PLATFORM
// ==========================================
export class MovingPlatform extends Platform {
    constructor(x, y, w, h, endX, endY, speed = 80) {
        super(x, y, w, h, { color: '#fbbf24' }); // Gold / amber trim
        this.startX = x;
        this.startY = y;
        this.endX = endX;
        this.endY = endY;
        this.speed = speed;
        this.t = 0;
        this.dx = 0;
        this.dy = 0;
        this.distance = Math.hypot(endX - x, endY - y) || 1;
        this.period = (this.distance / speed) * 2;
    }

    update(dt) {
        this.t += dt;
        const cycle = (Math.sin((this.t * Math.PI * 2) / this.period) + 1) / 2;

        const newX = this.startX + (this.endX - this.startX) * cycle;
        const newY = this.startY + (this.endY - this.startY) * cycle;

        this.dx = newX - this.x;
        this.dy = newY - this.y;

        this.x = newX;
        this.y = newY;
    }

    draw(ctx) {
        super.draw(ctx);
        // Thrusters underneath
        ctx.save();
        ctx.fillStyle = '#f59e0b';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 8;
        ctx.fillRect(this.x + 8, this.y + this.h, 10, 3);
        ctx.fillRect(this.x + this.w - 18, this.y + this.h, 10, 3);
        ctx.restore();
    }
}

// ==========================================
// 3. FALLING / CRUMBLING PLATFORM
// ==========================================
export class FallingPlatform extends LevelElement {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.type = 'falling';
        this.origX = x;
        this.origY = y;
        this.state = 'idle'; // 'idle', 'shaking', 'falling', 'respawning'
        this.timer = 0;
        this.vy = 0;
        this.shakeOffset = 0;
        this.color = '#e2e8f0';
    }

    update(dt, player, audio, particles) {
        if (this.state === 'shaking') {
            this.timer -= dt;
            this.shakeOffset = (Math.random() - 0.5) * 6;
            if (this.timer <= 0) {
                this.state = 'falling';
                this.vy = 60;
                audio.playBreak();
                particles.emitJump(this.x + this.w / 2, this.y, '#e2e8f0');
            }
        } else if (this.state === 'falling') {
            this.vy += 800 * dt;
            this.y += this.vy * dt;
            if (this.y > this.origY + 600) {
                this.state = 'respawning';
                this.timer = 3.0; // Respawns after 3s
            }
        } else if (this.state === 'respawning') {
            this.timer -= dt;
            if (this.timer <= 0) {
                this.state = 'idle';
                this.x = this.origX;
                this.y = this.origY;
                this.vy = 0;
                this.shakeOffset = 0;
            }
        }
    }

    resolveCollision(player) {
        if (this.state === 'falling' || this.state === 'respawning') return false;

        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x + this.shakeOffset, this.y, this.w, this.h);
        if (res.collided) {
            player.x += res.normalX * res.overlap;
            player.y += res.normalY * res.overlap;

            const dot = player.vx * res.normalX + player.vy * res.normalY;
            if (dot < 0) {
                player.vx -= dot * res.normalX;
                player.vy -= dot * res.normalY;
            }

            if (res.normalY < -0.7) {
                player.setGrounded(this, res.normalX, res.normalY);
                if (this.state === 'idle') {
                    this.state = 'shaking';
                    this.timer = 0.55; // Shakes for 0.55s before dropping
                }
            }
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (this.state === 'respawning') return;

        ctx.save();
        const drawX = this.x + (this.state === 'shaking' ? this.shakeOffset : 0);
        ctx.fillStyle = '#334155';
        ctx.fillRect(drawX, this.y, this.w, this.h);

        // Warning light bar
        const trimColor = this.state === 'shaking' ? '#ef4444' : '#94a3b8';
        ctx.fillStyle = trimColor;
        ctx.shadowColor = trimColor;
        ctx.shadowBlur = this.state === 'shaking' ? 12 : 6;
        ctx.fillRect(drawX, this.y, this.w, 3);
        ctx.restore();
    }
}

// ==========================================
// 4. ROTATING PLATFORM
// ==========================================
export class RotatingPlatform extends LevelElement {
    constructor(cx, cy, armLength = 70, speed = 1.4, width = 80, height = 14) {
        super(cx - armLength, cy - height / 2, width, height);
        this.cx = cx;
        this.cy = cy;
        this.armLength = armLength;
        this.speed = speed;
        this.angle = 0;
        this.w = width;
        this.h = height;
        this.dx = 0;
        this.dy = 0;
    }

    update(dt) {
        this.angle += this.speed * dt;
        const newX = this.cx + Math.cos(this.angle) * this.armLength - this.w / 2;
        const newY = this.cy + Math.sin(this.angle) * this.armLength - this.h / 2;

        this.dx = newX - this.x;
        this.dy = newY - this.y;

        this.x = newX;
        this.y = newY;
    }

    resolveCollision(player) {
        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x, this.y, this.w, this.h);
        if (res.collided) {
            player.x += res.normalX * res.overlap;
            player.y += res.normalY * res.overlap;

            const dot = player.vx * res.normalX + player.vy * res.normalY;
            if (dot < 0) {
                player.vx -= dot * res.normalX;
                player.vy -= dot * res.normalY;
            }

            if (res.normalY < -0.7) {
                player.setGrounded(this, res.normalX, res.normalY);
            }
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        // Central pivot hub
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Arm spoke
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy);
        ctx.lineTo(this.x + this.w / 2, this.y + this.h / 2);
        ctx.stroke();

        // Platform body
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Neon Edge
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(this.x, this.y, this.w, 3);
        ctx.restore();
    }
}

// ==========================================
// 5. SPIKES (Crystal Hazards)
// ==========================================
export class Spikes extends LevelElement {
    constructor(x, y, count = 3, orientation = 'up') {
        const width = count * 20;
        const height = 18;
        super(x, y, width, height);
        this.count = count;
        this.orientation = orientation; // 'up', 'down', 'left', 'right'
        this.color = '#ff3366'; // Neon Crimson
    }

    checkHazard(player) {
        // Tight hitbox check
        const padding = 3;
        const res = Physics.testCircleAABB(
            player.x, player.y, player.radius - padding,
            this.x, this.y, this.w, this.h
        );
        return res.collided;
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 12;

        const spikeW = this.w / this.count;
        for (let i = 0; i < this.count; i++) {
            const sx = this.x + i * spikeW;

            // Spikes gradient
            const grad = ctx.createLinearGradient(sx, this.y + this.h, sx, this.y);
            grad.addColorStop(0, '#e11d48');
            grad.addColorStop(1, '#ff3366');
            ctx.fillStyle = grad;

            ctx.beginPath();
            if (this.orientation === 'up') {
                ctx.moveTo(sx, this.y + this.h);
                ctx.lineTo(sx + spikeW / 2, this.y);
                ctx.lineTo(sx + spikeW, this.y + this.h);
            } else if (this.orientation === 'down') {
                ctx.moveTo(sx, this.y);
                ctx.lineTo(sx + spikeW / 2, this.y + this.h);
                ctx.lineTo(sx + spikeW, this.y);
            }
            ctx.closePath();
            ctx.fill();

            // Inner highlight
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(sx + spikeW / 2, this.y);
            ctx.lineTo(sx + spikeW / 2, this.y + this.h * 0.7);
            ctx.stroke();
        }
        ctx.restore();
    }
}

// ==========================================
// 6. ROTATING SAW BLADE
// ==========================================
export class RotatingBlade extends LevelElement {
    constructor(x, y, radius = 24, speed = 4) {
        super(x - radius, y - radius, radius * 2, radius * 2);
        this.cx = x;
        this.cy = y;
        this.radius = radius;
        this.speed = speed;
        this.rotation = 0;
    }

    update(dt) {
        this.rotation += this.speed * dt;
    }

    checkHazard(player) {
        const res = Physics.testCircleCircle(player.x, player.y, player.radius - 2, this.cx, this.cy, this.radius - 4);
        return res.collided;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.cx, this.cy);
        ctx.rotate(this.rotation);

        const r = this.radius;

        // Serrated blade teeth
        ctx.shadowColor = '#ff3366';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        const teeth = 8;
        for (let i = 0; i < teeth; i++) {
            const angle = (i * Math.PI * 2) / teeth;
            const nextAngle = ((i + 1) * Math.PI * 2) / teeth;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            ctx.lineTo(Math.cos(angle + 0.2) * (r * 0.65), Math.sin(angle + 0.2) * (r * 0.65));
        }
        ctx.closePath();
        ctx.fill();

        // Inner glowing core
        ctx.fillStyle = '#ff3366';
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// ==========================================
// 7. LASER BEAM
// ==========================================
export class Laser extends LevelElement {
    constructor(x1, y1, x2, y2, onDuration = 2.0, offDuration = 1.5, offset = 0) {
        super(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1) || 6, Math.abs(y2 - y1) || 6);
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.onDuration = onDuration;
        this.offDuration = offDuration;
        this.cycleTime = onDuration + offDuration;
        this.timer = offset;
        this.isActive = true;
        this.isWarning = false;
    }

    update(dt) {
        this.timer = (this.timer + dt) % this.cycleTime;
        if (this.timer < this.onDuration) {
            this.isActive = true;
            this.isWarning = false;
        } else if (this.timer >= this.cycleTime - 0.5) {
            // Warning flicker before turning back on
            this.isActive = false;
            this.isWarning = Math.floor(this.timer * 12) % 2 === 0;
        } else {
            this.isActive = false;
            this.isWarning = false;
        }
    }

    checkHazard(player) {
        if (!this.isActive) return false;
        const res = Physics.testCircleSegment(player.x, player.y, player.radius - 2, this.x1, this.y1, this.x2, this.y2);
        return res.collided;
    }

    draw(ctx) {
        ctx.save();
        // Emitter Pylons
        ctx.fillStyle = '#334155';
        ctx.fillRect(this.x1 - 4, this.y1 - 4, 8, 8);
        ctx.fillRect(this.x2 - 4, this.y2 - 4, 8, 8);

        if (this.isActive || this.isWarning) {
            const color = this.isWarning ? 'rgba(255, 51, 102, 0.4)' : '#ff3366';
            ctx.strokeStyle = color;
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = this.isActive ? 18 : 6;
            ctx.lineWidth = this.isActive ? 4.5 : 1.5;

            ctx.beginPath();
            ctx.moveTo(this.x1, this.y1);
            ctx.lineTo(this.x2, this.y2);
            ctx.stroke();

            // Inner white laser core
            if (this.isActive) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(this.x1, this.y1);
                ctx.lineTo(this.x2, this.y2);
                ctx.stroke();
            }
        }
        ctx.restore();
    }
}

// ==========================================
// 8. BOUNCE PAD
// ==========================================
export class BouncePad extends LevelElement {
    constructor(x, y, w = 48, h = 14, strength = 780) {
        super(x, y, w, h);
        this.strength = strength;
        this.compress = 0;
    }

    update(dt) {
        if (this.compress > 0) {
            this.compress -= dt * 4;
            if (this.compress < 0) this.compress = 0;
        }
    }

    resolveCollision(player, audio, particles) {
        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x, this.y, this.w, this.h);
        if (res.collided) {
            if (res.normalY < -0.4 && player.gravityScale > 0) {
                // Bounce upward!
                player.applyBouncePad(this.strength);
                this.compress = 1;
                audio.playBounce();
                particles.emitBounce(this.x + this.w / 2, this.y, '#38bdf8');
                return true;
            } else if (res.normalY > 0.4 && player.gravityScale < 0) {
                player.applyBouncePad(this.strength);
                this.compress = 1;
                audio.playBounce();
                particles.emitBounce(this.x + this.w / 2, this.y + this.h, '#38bdf8');
                return true;
            }
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        // Base plate
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(this.x, this.y + 4, this.w, this.h - 4);

        // Spring cushion with compression
        const springY = this.y + this.compress * 5;
        const springH = 6 - this.compress * 2;

        ctx.fillStyle = '#00e5ff';
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(this.x + 2, springY, this.w - 4, springH, 3);
        ctx.fill();

        ctx.restore();
    }
}

// ==========================================
// 9. SPEED BOOSTER
// ==========================================
export class SpeedBooster extends LevelElement {
    constructor(x, y, w = 54, h = 12, dirX = 1, strength = 640) {
        super(x, y, w, h);
        this.dirX = dirX;
        this.strength = strength;
        this.t = 0;
    }

    update(dt) {
        this.t += dt;
    }

    resolveCollision(player, audio, particles) {
        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x, this.y, this.w, this.h);
        if (res.collided) {
            player.applySpeedBoost(this.dirX, this.strength);
            audio.playSpeedBoost();
            particles.emitSpeedBoost(this.x + this.w / 2, this.y + this.h / 2, this.dirX);
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        // Base track
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Animated neon chevron arrows
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2.5;

        const offset = (this.t * 30 * this.dirX) % 16;
        for (let i = -16; i < this.w + 16; i += 16) {
            const cx = this.x + i + offset;
            if (cx < this.x || cx > this.x + this.w - 8) continue;
            ctx.beginPath();
            ctx.moveTo(cx, this.y + 2);
            ctx.lineTo(cx + this.dirX * 6, this.y + this.h / 2);
            ctx.lineTo(cx, this.y + this.h - 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// ==========================================
// 10. GRAVITY ZONE (Vortex Field)
// ==========================================
export class GravityZone extends LevelElement {
    constructor(x, y, w, h, targetScale = -1.0) {
        super(x, y, w, h);
        this.targetScale = targetScale; // -1 for invert, 0.5 for low gravity
        this.t = 0;
    }

    update(dt) {
        this.t += dt;
    }

    checkZone(player) {
        const inside = (
            player.x >= this.x &&
            player.x <= this.x + this.w &&
            player.y >= this.y &&
            player.y <= this.y + this.h
        );

        if (inside) {
            player.gravityScale = this.targetScale;
        }
        return inside;
    }

    draw(ctx) {
        ctx.save();
        const color = this.targetScale < 0 ? '#a855f7' : '#38bdf8';

        // Holographic vortex field
        ctx.fillStyle = this.targetScale < 0 ? 'rgba(168, 85, 247, 0.12)' : 'rgba(56, 189, 248, 0.12)';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Pulsing border
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -this.t * 20;
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        // Center spinning icon
        const cx = this.x + this.w / 2;
        const cy = this.y + this.h / 2;
        ctx.setLineDash([]);
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.stroke();

        // Direction arrow
        ctx.fillStyle = color;
        ctx.beginPath();
        if (this.targetScale < 0) {
            // Up arrow
            ctx.moveTo(cx, cy - 8);
            ctx.lineTo(cx - 6, cy + 4);
            ctx.lineTo(cx + 6, cy + 4);
        } else {
            // Float waves
            ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        }
        ctx.fill();

        ctx.restore();
    }
}

// ==========================================
// 11. BREAKABLE PLATFORM
// ==========================================
export class BreakablePlatform extends LevelElement {
    constructor(x, y, w = 60, h = 14) {
        super(x, y, w, h);
        this.broken = false;
        this.respawnTimer = 0;
    }

    update(dt) {
        if (this.broken) {
            this.respawnTimer -= dt;
            if (this.respawnTimer <= 0) {
                this.broken = false;
            }
        }
    }

    resolveCollision(player, audio, particles) {
        if (this.broken) return false;

        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x, this.y, this.w, this.h);
        if (res.collided) {
            player.x += res.normalX * res.overlap;
            player.y += res.normalY * res.overlap;

            if (res.normalY < -0.6) {
                player.setGrounded(this, res.normalX, res.normalY);
                // Shatter!
                this.broken = true;
                this.respawnTimer = 2.8;
                audio.playBreak();
                particles.emitDeath(this.x + this.w / 2, this.y + this.h / 2, '#38bdf8');
            }
            return true;
        }
        return false;
    }

    draw(ctx) {
        if (this.broken) return;

        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(this.x, this.y, this.w, this.h);

        // Crack pattern
        ctx.strokeStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(this.x + 10, this.y);
        ctx.lineTo(this.x + 22, this.y + this.h / 2);
        ctx.lineTo(this.x + 35, this.y);
        ctx.lineTo(this.x + 48, this.y + this.h);
        ctx.stroke();

        ctx.restore();
    }
}

// ==========================================
// 12. TIMED DOOR
// ==========================================
export class TimedDoor extends LevelElement {
    constructor(x, y, w = 16, h = 80, openDuration = 2.0, closeDuration = 2.0, offset = 0) {
        super(x, y, w, h);
        this.totalHeight = h;
        this.openDuration = openDuration;
        this.closeDuration = closeDuration;
        this.cycleTime = openDuration + closeDuration;
        this.timer = offset;
        this.currentH = h;
        this.isOpen = false;
    }

    update(dt) {
        this.timer = (this.timer + dt) % this.cycleTime;
        if (this.timer < this.openDuration) {
            this.isOpen = true;
            this.currentH = Math.max(0, this.currentH - dt * 250);
        } else {
            this.isOpen = false;
            this.currentH = Math.min(this.totalHeight, this.currentH + dt * 250);
        }
    }

    resolveCollision(player) {
        if (this.currentH <= 2) return false;

        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x, this.y, this.w, this.currentH);
        if (res.collided) {
            player.x += res.normalX * res.overlap;
            player.y += res.normalY * res.overlap;
            const dot = player.vx * res.normalX + player.vy * res.normalY;
            if (dot < 0) {
                player.vx -= dot * res.normalX;
                player.vy -= dot * res.normalY;
            }
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        // Top and bottom mounting frames
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(this.x - 2, this.y - 4, this.w + 4, 6);
        ctx.fillRect(this.x - 2, this.y + this.totalHeight - 2, this.w + 4, 6);

        if (this.currentH > 2) {
            // Sliding security barrier
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(this.x, this.y, this.w, this.currentH);

            // Red warning beam center line
            ctx.fillStyle = '#ff3366';
            ctx.shadowColor = '#ff3366';
            ctx.shadowBlur = 10;
            ctx.fillRect(this.x + this.w / 2 - 1.5, this.y + 2, 3, this.currentH - 4);
        }
        ctx.restore();
    }
}

// ==========================================
// 13. CHECKPOINT PYLON
// ==========================================
export class Checkpoint extends LevelElement {
    constructor(x, y, id = 1) {
        super(x - 16, y - 56, 32, 56);
        this.id = id;
        this.activated = false;
        this.rot = 0;
    }

    update(dt) {
        this.rot += dt * 2;
    }

    checkActivation(player, audio, particles) {
        if (this.activated) return;

        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x, this.y, this.w, this.h);
        if (res.collided) {
            this.activated = true;
            player.setCheckpoint(this.x + this.w / 2, this.y + this.h - player.radius - 2);
            audio.playCheckpoint();
            particles.emitCheckpoint(this.x + this.w / 2, this.y + 16);
        }
    }

    draw(ctx) {
        ctx.save();
        const color = this.activated ? '#10b981' : '#38bdf8';

        // Pylon pedestal base
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(this.x + 6, this.y + 36, this.w - 12, 20);

        // Base light ring
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.fillRect(this.x + 4, this.y + 42, this.w - 8, 3);

        // Floating spinning holographic diamond
        const diamondY = this.y + 16 + Math.sin(this.rot * 1.5) * 4;
        ctx.save();
        ctx.translate(this.x + this.w / 2, diamondY);
        ctx.rotate(this.rot);

        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 16;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = this.activated ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.3)';
        ctx.fill();

        ctx.restore();
        ctx.restore();
    }
}

// ==========================================
// 14. FINISH PORTAL
// ==========================================
export class FinishPortal extends LevelElement {
    constructor(x, y, w = 48, h = 76) {
        super(x, y, w, h);
        this.t = 0;
    }

    update(dt, particles) {
        this.t += dt;
        if (particles) {
            particles.emitFinishWarp(this.x + this.w / 2, this.y + this.h / 2);
        }
    }

    checkCompletion(player) {
        const res = Physics.testCircleAABB(player.x, player.y, player.radius, this.x + 6, this.y + 8, this.w - 12, this.h - 16);
        return res.collided;
    }

    draw(ctx) {
        ctx.save();
        // Heavy sci-fi portal pillars
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(this.x, this.y, 8, this.h);
        ctx.fillRect(this.x + this.w - 8, this.y, 8, this.h);

        // Checkered Header arch (Reference Image 2 finish design)
        ctx.fillRect(this.x, this.y, this.w, 14);
        const checkW = 6;
        for (let i = 0; i < this.w; i += checkW) {
            ctx.fillStyle = (Math.floor(i / checkW) % 2 === 0) ? '#ffffff' : '#0284c7';
            ctx.fillRect(this.x + i, this.y + 2, checkW, 10);
        }

        // Swirling Energy Vortex Gate
        const grad = ctx.createRadialGradient(
            this.x + this.w / 2, this.y + this.h / 2, 4,
            this.x + this.w / 2, this.y + this.h / 2, this.w / 2
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.4, '#38bdf8');
        grad.addColorStop(0.8, '#0284c7');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');

        ctx.fillStyle = grad;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 24;
        ctx.fillRect(this.x + 8, this.y + 14, this.w - 16, this.h - 14);

        // Energy pulses
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        const pulse = (Math.sin(this.t * 4) + 1) * 3;
        ctx.strokeRect(this.x + 12 - pulse / 2, this.y + 18 - pulse / 2, this.w - 24 + pulse, this.h - 22 + pulse);

        ctx.restore();
    }
}
