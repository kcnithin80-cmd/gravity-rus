// Gravity Rush - Particle Engine
export class ParticleSystem {
    constructor() {
        this.particles = [];
        this.ambientParticles = [];
        this.quality = 'high'; // 'low', 'medium', 'high'
        this.maxParticles = 500;
        this.ambientWorld = 'city';
    }

    setQuality(q) {
        this.quality = q;
        if (q === 'low') this.maxParticles = 120;
        else if (q === 'medium') this.maxParticles = 280;
        else this.maxParticles = 550;
    }

    reset() {
        this.particles = [];
    }

    update(dt) {
        // Update standard particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += dt;
            if (p.age >= p.life) {
                this.particles.splice(i, 1);
                continue;
            }

            // Physics update
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= Math.pow(p.drag || 0.98, dt * 60);
            p.vy *= Math.pow(p.drag || 0.98, dt * 60);
            p.vy += (p.gravity || 0) * dt;

            if (p.rotation !== undefined) {
                p.rotation += (p.vRot || 0) * dt;
            }

            // Alpha decay & size growth/shrink
            const progress = p.age / p.life;
            p.alpha = p.initialAlpha * (1 - progress);
            if (p.grow) {
                p.size = p.initialSize + (p.finalSize - p.initialSize) * progress;
            }
        }

        // Ambient world particles update
        for (let i = 0; i < this.ambientParticles.length; i++) {
            const ap = this.ambientParticles[i];
            ap.x += ap.vx * dt;
            ap.y += ap.vy * dt;
            ap.age = (ap.age + dt) % ap.life;

            // Wrap within camera bounds will be done in draw
        }
    }

    draw(ctx, camera) {
        // Draw ambient particles
        this.drawAmbient(ctx, camera);

        // Draw dynamic particles
        ctx.save();
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            // Culling
            if (
                p.x < camera.x - 100 ||
                p.x > camera.x + camera.width + 100 ||
                p.y < camera.y - 100 ||
                p.y > camera.y + camera.height + 100
            ) {
                continue;
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

            if (p.blendMode) {
                ctx.globalCompositeOperation = p.blendMode;
            }

            if (p.glow) {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = p.glow;
            }

            if (p.type === 'circle') {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'ring') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.lineWidth || 2;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(1, p.size), 0, Math.PI * 2);
                ctx.stroke();
            } else if (p.type === 'shard') {
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation || 0);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(-p.size, -p.size * 0.6);
                ctx.lineTo(p.size, 0);
                ctx.lineTo(-p.size * 0.4, p.size * 0.8);
                ctx.closePath();
                ctx.fill();
            } else if (p.type === 'line') {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.lineWidth || 2;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05);
                ctx.stroke();
            }

            ctx.restore();
        }
        ctx.restore();
    }

    // ==========================================
    // EMITTER METHODS
    // ==========================================

    addParticle(config) {
        if (this.particles.length >= this.maxParticles) {
            // Drop oldest
            this.particles.shift();
        }
        this.particles.push({
            x: config.x,
            y: config.y,
            vx: config.vx || 0,
            vy: config.vy || 0,
            drag: config.drag !== undefined ? config.drag : 0.96,
            gravity: config.gravity || 0,
            age: 0,
            life: config.life || 0.5,
            initialAlpha: config.alpha !== undefined ? config.alpha : 1,
            alpha: config.alpha !== undefined ? config.alpha : 1,
            initialSize: config.size || 3,
            size: config.size || 3,
            finalSize: config.finalSize || config.size || 3,
            grow: config.finalSize !== undefined,
            color: config.color || '#00e5ff',
            glow: config.glow || 0,
            blendMode: config.blendMode || 'source-over',
            type: config.type || 'circle',
            lineWidth: config.lineWidth || 2,
            rotation: config.rotation || 0,
            vRot: config.vRot || 0
        });
    }

    emitJump(x, y, color = '#00e5ff') {
        const count = this.quality === 'low' ? 6 : this.quality === 'medium' ? 12 : 20;
        // Ring shockwave
        this.addParticle({
            x, y: y + 2,
            size: 4, finalSize: 22,
            life: 0.25,
            color: color,
            alpha: 0.8,
            type: 'ring',
            lineWidth: 2.5,
            blendMode: 'lighter',
            glow: 10
        });

        // Dust / spark particles
        for (let i = 0; i < count; i++) {
            const angle = Math.PI + (Math.random() - 0.5) * 1.6;
            const speed = 40 + Math.random() * 120;
            this.addParticle({
                x: x + (Math.random() - 0.5) * 12,
                y: y + 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed * 0.4,
                gravity: 200,
                size: 2 + Math.random() * 3,
                finalSize: 0.5,
                life: 0.25 + Math.random() * 0.2,
                color: Math.random() > 0.4 ? color : '#ffffff',
                alpha: 0.9,
                blendMode: 'lighter'
            });
        }
    }

    emitLand(x, y, speed = 1, color = '#00e5ff') {
        const count = this.quality === 'low' ? 8 : this.quality === 'medium' ? 16 : 24;
        const radius = Math.min(32, 10 + speed * 1.5);

        // Ring
        this.addParticle({
            x, y: y + 2,
            size: 4, finalSize: radius,
            life: 0.28,
            color: color,
            alpha: 0.9,
            type: 'ring',
            lineWidth: 2,
            blendMode: 'lighter',
            glow: 12
        });

        // Lateral sparks
        for (let i = 0; i < count; i++) {
            const dir = Math.random() > 0.5 ? 1 : -1;
            const spd = 60 + Math.random() * 160 * (speed / 10);
            this.addParticle({
                x, y,
                vx: dir * spd * (0.6 + Math.random() * 0.8),
                vy: -30 - Math.random() * 80,
                gravity: 350,
                drag: 0.92,
                size: 2 + Math.random() * 2.5,
                finalSize: 0.5,
                life: 0.3 + Math.random() * 0.25,
                color: Math.random() > 0.3 ? color : '#ffffff',
                alpha: 0.9,
                blendMode: 'lighter'
            });
        }
    }

    emitBounce(x, y, color = '#00e5ff') {
        const count = this.quality === 'low' ? 10 : 22;
        this.addParticle({
            x, y,
            size: 6, finalSize: 36,
            life: 0.35,
            color: '#38bdf8',
            alpha: 1,
            type: 'ring',
            lineWidth: 3,
            blendMode: 'lighter',
            glow: 15
        });

        for (let i = 0; i < count; i++) {
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
            const speed = 100 + Math.random() * 220;
            this.addParticle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                drag: 0.94,
                gravity: 280,
                size: 2.5 + Math.random() * 3,
                finalSize: 0.5,
                life: 0.4 + Math.random() * 0.25,
                color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
                alpha: 1,
                blendMode: 'lighter'
            });
        }
    }

    emitSpeedBoost(x, y, dirX, color = '#38bdf8') {
        const count = this.quality === 'low' ? 8 : 18;
        for (let i = 0; i < count; i++) {
            this.addParticle({
                x: x - dirX * 12 + (Math.random() - 0.5) * 8,
                y: y + (Math.random() - 0.5) * 10,
                vx: -dirX * (180 + Math.random() * 280),
                vy: (Math.random() - 0.5) * 60,
                drag: 0.9,
                size: 3 + Math.random() * 4,
                finalSize: 0.5,
                life: 0.25 + Math.random() * 0.2,
                color: Math.random() > 0.3 ? color : '#ffffff',
                alpha: 0.9,
                blendMode: 'lighter',
                type: 'line',
                lineWidth: 2
            });
        }
    }

    emitTrail(x, y, color = '#00e5ff', size = 12) {
        if (this.quality === 'low' && Math.random() > 0.5) return;
        this.addParticle({
            x: x + (Math.random() - 0.5) * 4,
            y: y + (Math.random() - 0.5) * 4,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            size: size * 0.65,
            finalSize: 1,
            life: 0.22,
            alpha: 0.45,
            color: color,
            glow: 8,
            blendMode: 'lighter'
        });
    }

    emitDeath(x, y, color = '#ff3366') {
        const count = this.quality === 'low' ? 25 : 55;
        // Shockwave
        this.addParticle({
            x, y,
            size: 5, finalSize: 65,
            life: 0.45,
            color: color,
            alpha: 1,
            type: 'ring',
            lineWidth: 4,
            glow: 20,
            blendMode: 'lighter'
        });

        // Fragments / metallic shards
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 320;
            this.addParticle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                drag: 0.95,
                gravity: 300,
                size: 3 + Math.random() * 6,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 15,
                life: 0.5 + Math.random() * 0.5,
                color: Math.random() > 0.5 ? color : (Math.random() > 0.5 ? '#ffffff' : '#334155'),
                alpha: 1,
                type: 'shard',
                blendMode: 'lighter',
                glow: 10
            });
        }
    }

    emitCheckpoint(x, y) {
        const count = 35;
        this.addParticle({
            x, y,
            size: 8, finalSize: 50,
            life: 0.5,
            color: '#10b981',
            alpha: 1,
            type: 'ring',
            lineWidth: 3,
            glow: 18,
            blendMode: 'lighter'
        });

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 180;
            this.addParticle({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 40,
                drag: 0.94,
                gravity: 120,
                size: 2.5 + Math.random() * 3.5,
                finalSize: 0.5,
                life: 0.6 + Math.random() * 0.4,
                color: Math.random() > 0.3 ? '#10b981' : '#a7f3d0',
                alpha: 1,
                blendMode: 'lighter',
                glow: 12
            });
        }
    }

    emitFinishWarp(x, y) {
        // Continuous vortex suction into finish gate
        for (let i = 0; i < 4; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 40;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            this.addParticle({
                x: px, y: py,
                vx: (x - px) * 2.5,
                vy: (y - py) * 2.5,
                size: 1 + Math.random() * 3,
                finalSize: 0.5,
                life: 0.4,
                color: '#38bdf8',
                alpha: 0.8,
                glow: 8,
                blendMode: 'lighter'
            });
        }
    }

    // ==========================================
    // AMBIENT WEATHER / ATMOSPHERE
    // ==========================================

    initAmbientWorld(worldTheme, viewWidth = 1200, viewHeight = 800) {
        this.ambientWorld = worldTheme;
        this.ambientParticles = [];
        const count = this.quality === 'low' ? 30 : this.quality === 'medium' ? 60 : 100;

        for (let i = 0; i < count; i++) {
            let p = {
                x: Math.random() * viewWidth,
                y: Math.random() * viewHeight,
                size: 1 + Math.random() * 2.5,
                age: Math.random() * 10,
                life: 10,
                alpha: 0.2 + Math.random() * 0.5,
                color: '#38bdf8'
            };

            if (worldTheme === 'city' || worldTheme === 'cyber') {
                p.vx = -15 - Math.random() * 30;
                p.vy = 40 + Math.random() * 60; // Cyber neon rain / dust
                p.color = Math.random() > 0.5 ? '#00e5ff' : '#d946ef';
            } else if (worldTheme === 'space') {
                p.vx = (Math.random() - 0.5) * 8;
                p.vy = (Math.random() - 0.5) * 8; // Drifting cosmic stardust
                p.color = '#ffffff';
            } else if (worldTheme === 'ice') {
                p.vx = -30 - Math.random() * 40;
                p.vy = 25 + Math.random() * 35; // Gentle snow crystals
                p.color = '#e0f2fe';
                p.size = 1.5 + Math.random() * 3;
            } else if (worldTheme === 'lava') {
                p.vx = (Math.random() - 0.5) * 25;
                p.vy = -50 - Math.random() * 60; // Rising magma embers
                p.color = Math.random() > 0.4 ? '#f97316' : '#ef4444';
            } else {
                p.vx = -10 - Math.random() * 15;
                p.vy = 10 + Math.random() * 20;
                p.color = '#a7f3d0';
            }

            this.ambientParticles.push(p);
        }
    }

    drawAmbient(ctx, camera) {
        if (!this.ambientParticles.length) return;
        ctx.save();
        for (let i = 0; i < this.ambientParticles.length; i++) {
            const p = this.ambientParticles[i];

            // Wrap relative to screen
            const screenX = ((p.x - camera.x * 0.3) % camera.width + camera.width) % camera.width + camera.x;
            const screenY = ((p.y - camera.y * 0.3) % camera.height + camera.height) % camera.height + camera.y;

            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
